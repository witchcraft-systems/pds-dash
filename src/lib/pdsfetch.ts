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
import { Config } from "../../config";
// import { ComAtprotoRepoListRecords.Record } from "@atcute/client/lexicons";
// import { AppBskyFeedPost } from "@atcute/client/lexicons";
// import { AppBskyActorDefs } from "@atcute/client/lexicons";

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
  postCid: string;
  recordName: string;
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
    this.postCid = record.cid;
    this.recordName = processAtUri(record.uri).rkey;
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
    service: Config.PDS_URL,
  }),
});

const getDidsFromPDS = async () : Promise<At.Did[]> => {
  const { data } = await rpc.get("com.atproto.sync.listRepos", {
    params: {},
  });
  return data.repos.map((repo: any) => (repo.did)) as At.Did[];
};
const getAccountMetadata = async (did: `did:${string}:${string}`) : Promise<AccountMetadata> => {
  // gonna assume self exists in the app.bsky.actor.profile
  try {
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
  }
  catch (e) {
    console.error(`Error fetching metadata for ${did}:`, e);
    return {
      did: "error",
      displayName: "",
      avatarCid: null,
      handle: "error",
    };
  }
};

const getAllMetadataFromPds = async () : Promise<AccountMetadata[]> => {
  const dids = await getDidsFromPDS();
  const metadata = await Promise.all(
    dids.map(async (repo: `did:${string}:${string}`) => {
      return await getAccountMetadata(repo);
    }),
  );
  return metadata.filter(account => account.did !== "error");
};

const fetchPosts = async (did: string) => {
  try {
    const { data } = await rpc.get("com.atproto.repo.listRecords", {
      params: {
        repo: did as At.Identifier,
        collection: "app.bsky.feed.post",
        limit: Config.MAX_POSTS,
      },
    });
    return {
      records: data.records as ComAtprotoRepoListRecords.Record[],
      did: did,
      error: false
    };
  } catch (e) {
    console.error(`Error fetching posts for ${did}:`, e);
    return {
      records: [],
      did: did,
      error: true
    };
  }
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
  const validPostRecords = postRecords.filter(record => !record.error);
  const posts: Post[] = validPostRecords.flatMap((userFetch) =>
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
  return posts.slice(0, Config.MAX_POSTS);
};
export { fetchAllPosts, getAllMetadataFromPds, Post };
export type { AccountMetadata };
