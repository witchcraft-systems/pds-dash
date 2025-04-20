import { simpleFetchHandler, XRPC } from "@atcute/client";
import "@atcute/bluesky/lexicons";
import type {
  AppBskyActorDefs,
  AppBskyActorProfile,
  AppBskyFeedPost,
  At,
  ComAtprotoRepoListRecords,
} from "@atcute/client/lexicons";
import {
  CompositeDidDocumentResolver,
  PlcDidDocumentResolver,
  WebDidDocumentResolver,
} from "@atcute/identity-resolver";

interface AccountMetadata {
  did: string;
  displayName: string;
  handle: string;
  avatarCid: string | null;
}
interface atUriObject {
  repo: string;
  collection: string;
  rkey: string;
}
class Post {
  authorDid: string;
  authorAvatarCid: string | null;
  authorHandle: string;
  displayName: string;
  text: string;
  timestamp: number;
  timenotstamp: string;
  quotingUri: atUriObject | null;
  replyingUri: atUriObject | null;
  imagesCid: string[] | null;
  videosLinkCid: string | null;

  constructor(
    record: ComAtprotoRepoListRecords.Record,
    account: AccountMetadata,
  ) {
    this.authorDid = account.did;
    this.authorAvatarCid = account.avatarCid;
    this.authorHandle = account.handle;
    this.displayName = account.displayName;
    const post = record.value as AppBskyFeedPost.Record;
    this.timenotstamp = post.createdAt;
    this.text = post.text;
    this.timestamp = Date.parse(post.createdAt);
    if (post.reply) {
      this.replyingUri = processAtUri(post.reply.parent.uri);
    } else {
      this.replyingUri = null;
    }
    this.quotingUri = null;
    this.imagesCid = null;
    this.videosLinkCid = null;
    switch (post.embed?.$type) {
      case "app.bsky.embed.images":
        this.imagesCid = post.embed.images.map((imageRecord: any) =>
          imageRecord.image.ref.$link
        );
        break;
      case "app.bsky.embed.video":
        this.videosLinkCid = post.embed.video.ref.$link;
        break;
      case "app.bsky.embed.record":
        this.quotingUri = processAtUri(post.embed.record.uri);
        break;
      case "app.bsky.embed.recordWithMedia":
        this.quotingUri = processAtUri(post.embed.record.record.uri);
        switch (post.embed.media.$type) {
          case "app.bsky.embed.images":
            this.imagesCid = post.embed.media.images.map((imageRecord) =>
              imageRecord.image.ref.$link
            );

            break;
          case "app.bsky.embed.video":
            this.videosLinkCid = post.embed.media.video.ref.$link;

            break;
        }
        break;
    }
  }
}

const processAtUri = (aturi: string): atUriObject => {
  const parts = aturi.split("/");
  return {
    repo: parts[2],
    collection: parts[3],
    rkey: parts[4],
  };
};

const rpc = new XRPC({
  handler: simpleFetchHandler({
    service: "https://pds.witchcraft.systems",
  }),
});

const getDidsFromPDS = async () => {
  const { data } = await rpc.get("com.atproto.sync.listRepos", {
    params: {},
  });
  return data.repos.map((repo: any) => (repo.did));
};
const getAccountMetadata = async (did: `did:${string}:${string}`) => {
  // gonna assume self exists in the app.bsky.actor.profile
  const { data } = await rpc.get("com.atproto.repo.getRecord", {
    params: {
      repo: did,
      collection: "app.bsky.actor.profile",
      rkey: "self",
    },
  });
  const value = data.value as AppBskyActorProfile.Record;
  const handle = await blueskyHandleFromDid(did);
  const account: AccountMetadata = {
    did: did,
    handle: handle,
    displayName: value.displayName || "",
    avatarCid: null,
  };
  if (value.avatar) {
    account.avatarCid = value.avatar.ref["$link"];
  }
  return account;
};

const getAllMetadataFromPds = async () => {
  const dids = await getDidsFromPDS();
  const metadata = await Promise.all(
    dids.map(async (repo: `did:${string}:${string}`) => {
      return await getAccountMetadata(repo);
    }),
  );
  return metadata;
};

const fetchPosts = async (did: string) => {
  const { data } = await rpc.get("com.atproto.repo.listRecords", {
    params: {
      repo: did as At.Identifier,
      collection: "app.bsky.feed.post",
      limit: 5,
    },
  });
  return {
    records: data.records as ComAtprotoRepoListRecords.Record[],
    did: did,
  };
};

const identityResolve = async (did: At.Did) => {
  const resolver = new CompositeDidDocumentResolver({
    methods: {
      plc: new PlcDidDocumentResolver(),
      web: new WebDidDocumentResolver(),
    },
  });

  if (did.startsWith("did:plc:") || did.startsWith("did:web:")) {
    const doc = await resolver.resolve(
      did as `did:plc:${string}` | `did:web:${string}`,
    );
    return doc;
  } else {
    throw new Error(`Unsupported DID type: ${did}`);
  }
};

const blueskyHandleFromDid = async (did: At.Did) => {
  const doc = await identityResolve(did);
  if (doc.alsoKnownAs) {
    const handleAtUri = doc.alsoKnownAs.find((url) => url.startsWith("at://"));
    const handle = handleAtUri?.split("/")[2];
    if (!handle) {
      return "Handle not found";
    } else {
      return handle;
    }
  } else {
    return "Handle not found";
  }
};

const fetchAllPosts = async () => {
  const users: AccountMetadata[] = await getAllMetadataFromPds();
  const postRecords = await Promise.all(
    users.map(async (metadata: AccountMetadata) =>
      await fetchPosts(metadata.did)
    ),
  );
  const posts: Post[] = postRecords.flatMap((userFetch) =>
    userFetch.records.map((record) => {
      const user = users.find((user: AccountMetadata) =>
        user.did == userFetch.did
      );
      if (!user) {
        throw new Error(`User with DID ${userFetch.did} not found`);
      }
      return new Post(record, user);
    })
  );
  posts.sort((a, b) => b.timestamp - a.timestamp);
  return posts;
};

const testApiCall = async () => {
  const { data } = await rpc.get("com.atproto.sync.listRepos", {
    params: {},
  });
  console.log(data);
};
export { fetchAllPosts, getAllMetadataFromPds, Post };
export type { AccountMetadata };
