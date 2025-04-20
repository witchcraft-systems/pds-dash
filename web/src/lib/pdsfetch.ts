import { simpleFetchHandler, XRPC } from "@atcute/client";
import "@atcute/bluesky/lexicons";
// import { ComAtprotoRepoListRecords } from "@atcute/client/lexicons";
// import { AppBskyFeedPost } from "@atcute/client/lexicons";
// import { AppBskyActorDefs } from "@atcute/client/lexicons";

interface AccountMetadata {
  did: string;
  displayName: string;
  avatarCid: string | null;
}
class Post {
  authorDid: string;
  displayName : string;
  text: string;
  timestamp: number;
  timenotstamp: string;
  quotingDid: string | null;
  replyingDid: string | null;
  imagesLinksCid: string[] | null;
  imagesAltText: string[] | null;
  videosLinkCid: string | null;
  videosLinksUrls: string[] | null;

  constructor(record: ComAtprotoRepoListRecords.Record, account : AccountMetadata) {
    this.authorDid = account.did;
    this.displayName = account.displayName;
    const post = record.value as AppBskyFeedPost.Record;
    this.timenotstamp = post.createdAt;
    this.text = post.text;
    this.timestamp = Date.parse(post.createdAt);
    if (post.reply) {
      this.replyingDid = didFromATuri(post.reply.parent.uri).repo;
    } else {
      this.replyingDid = null;
    }
    this.quotingDid = null;
    this.imagesLinksCid = null;
    this.videosLinkCid = null;
    switch (post.embed?.$type) {
      case "app.bsky.embed.images":
        this.imagesLinksCid = post.embed.images.map((imageRecord) =>
          imageRecord.image.ref.$link
        );
        this.imagesAltText = post.embed.images.map((imageRecord) => imageRecord.alt || "no alt text :(")
        break;
      case "app.bsky.embed.video":
        this.videosLinkCid = post.embed.video.ref.$link;
        break;
      case "app.bsky.embed.record":
        this.quotingDid = didFromATuri(post.embed.record.uri).repo;
        break;
      case "app.bsky.embed.recordWithMedia":
        this.quotingDid = didFromATuri(post.embed.record.record.uri).repo;
        switch (post.embed.media.$type) {
          case "app.bsky.embed.images":
            this.imagesLinksCid = post.embed.media.images.map((imageRecord) =>
              imageRecord.image.ref.$link
            );
            this.imagesAltText = post.embed.images.map((imageRecord) => imageRecord.alt || "no alt text :(")

            break;
          case "app.bsky.embed.video":
            this.videosLinkCid = post.embed.media.video.ref.$link;
            
            break;
        }
        break;
    }
  }
}

const didFromATuri = (aturi: string) => {
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
  const value = data.value as AppBskyActorDefs.ProfileView;
  const account: AccountMetadata = {
    did: did,
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
      repo: did,
      collection: "app.bsky.feed.post",
      limit: 5,
    },
  });
  return {
    records: data.records as ComAtprotoRepoListRecords.Record[],
    did: did,
  };
};

const fetchAllPosts = async () => {
  const users: AccountMetadata[] = await getAllMetadataFromPds();
  const postRecords = await Promise.all(
    users.map(async (metadata: AccountMetadata) =>
      await fetchPosts(metadata.did)
    ),
  );
  const posts : Post[] = postRecords.flatMap((userFetch) =>
    userFetch.records.map((record) => new Post(record, users.find((user : AccountMetadata) => user.did == userFetch.did)))
  );
  posts.sort((a, b) => b.timestamp - a.timestamp);
  return posts;
};

export { fetchAllPosts, Post };