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
  did: At.Did;
  displayName: string;
  handle: string;
  avatarCid: string | null;
  currentCursor?: string;
}

let accountsMetadata: AccountMetadata[] = [];

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
        this.imagesCid = post.embed.images.map(
          (imageRecord: any) => imageRecord.image.ref.$link,
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
            this.imagesCid = post.embed.media.images.map(
              (imageRecord) => imageRecord.image.ref.$link,
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

const getDidsFromPDS = async (): Promise<At.Did[]> => {
  const { data } = await rpc.get("com.atproto.sync.listRepos", {
    params: {},
  });
  return data.repos.map((repo: any) => repo.did) as At.Did[];
};
const getAccountMetadata = async (
  did: `did:${string}:${string}`,
) => {
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
  } catch (e) {
    console.error(`Error fetching metadata for ${did}:`, e);
    return null;
  }
};

const getAllMetadataFromPds = async (): Promise<AccountMetadata[]> => {
  const dids = await getDidsFromPDS();
  const metadata = await Promise.all(
    dids.map(async (repo: `did:${string}:${string}`) => {
      return await getAccountMetadata(repo);
    }),
  );
  return metadata.filter((account) => account !== null) as AccountMetadata[];
};

// OLD
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
      error: false,
    };
  } catch (e) {
    console.error(`Error fetching posts for ${did}:`, e);
    return {
      records: [],
      did: did,
      error: true,
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

interface PostsAcc {
  posts: ComAtprotoRepoListRecords.Record[];
  account: AccountMetadata;
}
const getCutoffDate = (postAccounts: PostsAcc[]) => {
  const now = Date.now();
  let cutoffDate: Date | null = null;
  postAccounts.forEach((postAcc) => {
    const latestPost = new Date(
      (postAcc.posts[postAcc.posts.length - 1].value as AppBskyFeedPost.Record)
        .createdAt,
    );
    if (!cutoffDate) {
      cutoffDate = latestPost;
    } else {
      if (latestPost > cutoffDate) {
        cutoffDate = latestPost;
      }
    }
  });
  if (cutoffDate) {
    console.log("Cutoff date:", cutoffDate);
    return cutoffDate;
  } else {
    return new Date(now);
  }
};

const filterPostsByDate = (posts: PostsAcc[], cutoffDate: Date) => {
  // filter posts for each account that are older than the cutoff date and save the cursor of the last post included
  const filteredPosts: PostsAcc[] = posts.map((postAcc) => {
    const filtered = postAcc.posts.filter((post) => {
      const postDate = new Date(
        (post.value as AppBskyFeedPost.Record).createdAt,
      );
      return postDate >= cutoffDate;
    });
    if (filtered.length > 0) {
      postAcc.account.currentCursor = processAtUri(filtered[filtered.length - 1].uri).rkey;
    }
    return {
      posts: filtered,
      account: postAcc.account,
    };
  });
  return filteredPosts;
};
const getNextPosts = async () => {
  if (!accountsMetadata.length) {
    accountsMetadata = await getAllMetadataFromPds();
  }

  const postsAcc: PostsAcc[] = await Promise.all(
    accountsMetadata.map(async (account) => {
      const posts = await fetchPostsForUser(
        account.did,
        account.currentCursor || null,
      );
      if (posts) {
        return {
          posts: posts,
          account: account,
        };
      } else {
        return {
          posts: [],
          account: account,
        };
      }
    }),
  );
  const recordsFiltered = postsAcc.filter((postAcc) =>
    postAcc.posts.length > 0
  );
  const cutoffDate = getCutoffDate(recordsFiltered);
  const recordsCutoff = filterPostsByDate(recordsFiltered, cutoffDate);
  // update the accountMetadata with the new cursor
  accountsMetadata = accountsMetadata.map((account) => {
    const postAcc = recordsCutoff.find(
      (postAcc) => postAcc.account.did == account.did,
    );
    if (postAcc) {
      account.currentCursor = postAcc.account.currentCursor;
    }
    return account;
  }
  );
  // throw the records in a big single array
  let records = recordsCutoff.flatMap((postAcc) => postAcc.posts);
  // sort the records by timestamp
  records = records.sort((a, b) => {
    const aDate = new Date(
      (a.value as AppBskyFeedPost.Record).createdAt,
    ).getTime();
    const bDate = new Date(
      (b.value as AppBskyFeedPost.Record).createdAt,
    ).getTime();
    return bDate - aDate;
  });
  // filter out posts that are in the future
  if (!Config.SHOW_FUTURE_POSTS) {
    const now = Date.now();
    records = records.filter((post) => {
      const postDate = new Date(
        (post.value as AppBskyFeedPost.Record).createdAt,
      ).getTime();
      return postDate <= now;
    });
  }
  // append the new posts to the existing posts

  const newPosts = records.map((record) => {
    const account = accountsMetadata.find(
      (account) => account.did == processAtUri(record.uri).repo,
    );
    if (!account) {
      throw new Error(
        `Account with DID ${processAtUri(record.uri).repo} not found`,
      );
    }
    return new Post(record, account);
  });
  console.log("Fetched posts:", newPosts);
  console.log("Metadata:", accountsMetadata);
  return newPosts;
};

const fetchPostsForUser = async (did: At.Did, cursor: string | null) => {
  try {
    console.log("Fetching posts for user:", did, "with Cursor: ", cursor);
    const { data } = await rpc.get("com.atproto.repo.listRecords", {
      params: {
        repo: did as At.Identifier,
        collection: "app.bsky.feed.post",
        limit: Config.MAX_POSTS,
        cursor: cursor || undefined,
      },
    });
    return data.records as ComAtprotoRepoListRecords.Record[];
  } catch (e) {
    console.error(`Error fetching posts for ${did}:`, e);
    return null;
  }
};

// const fetchAllPosts = async () => {
//   const users: AccountMetadata[] = await getAllMetadataFromPds();
//   const postRecords = await Promise.all(
//     users.map(
//       async (metadata: AccountMetadata) => await fetchPosts(metadata.did),
//     ),
//   );
//   // Filter out any records that have an error
//   const validPostRecords = postRecords.filter((record) => !record.error);

//   const posts: Post[] = validPostRecords.flatMap((userFetch) =>
//     userFetch.records.map((record) => {
//       const user = users.find(
//         (user: AccountMetadata) => user.did == userFetch.did,
//       );
//       if (!user) {
//         throw new Error(`User with DID ${userFetch.did} not found`);
//       }
//       return new Post(record, user);
//     })
//   );

//   posts.sort((a, b) => b.timestamp - a.timestamp);

//   if (!Config.SHOW_FUTURE_POSTS) {
//     // Filter out posts that are in the future
//     const now = Date.now();
//     const filteredPosts = posts.filter((post) => post.timestamp <= now);
//     return filteredPosts.slice(0, Config.MAX_POSTS);
//   }

//   return posts.slice(0, Config.MAX_POSTS);
// };
export { getAllMetadataFromPds, getNextPosts, Post };
export type { AccountMetadata };
