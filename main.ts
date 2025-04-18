import { simpleFetchHandler, XRPC } from "@atcute/client";
import "@atcute/bluesky/lexicons";

interface AccountMetadata {
  did: string;
  displayName: string;
  avatarCid: string | null;
}
interface Post {
  text: string,
  timestamp: number,
  quoting: string | null,
  replying: string | null,
  imagesLinks: string[] | null,
  videosLinks: string[] | null,
}

const rpc = new XRPC({
  handler: simpleFetchHandler({
    service: Deno.env.get("PDS_URL") || "https://pds.witchcraft.systems",
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
  const { data: { value } } = await rpc.get("com.atproto.repo.getRecord", {
    params: {
      repo: did,
      collection: "app.bsky.actor.profile",
      rkey: "self",
    },
  });
  const account: AccountMetadata = {
    did: did,
    displayName: value.displayName,
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
