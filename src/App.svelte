<script lang="ts">
  import PostComponent from "./lib/PostComponent.svelte";
  import AccountComponent from "./lib/AccountComponent.svelte";
  import InfiniteLoading from "svelte-infinite-loading";
  import { getNextPosts, Post, getAllMetadataFromPds } from "./lib/pdsfetch";
  import { Config } from "../config";
  const accountsPromise = getAllMetadataFromPds();
  import { onMount } from "svelte";

  let posts: Post[] = [];

  onMount(() => {
    // Fetch initial posts
    getNextPosts().then((initialPosts) => {
      posts = initialPosts;
    });
  });
  // Infinite loading function
  const onInfinite = ({
    detail: { loaded, complete },
  }: {
    detail: { loaded: () => void; complete: () => void };
  }) => {
    getNextPosts().then((newPosts) => {
      console.log("Loading next posts...");
      if (newPosts.length > 0) {
        posts = [...posts, ...newPosts];
        loaded();
      } else {
        complete();
      }
    });
  };
</script>

<main>
  <div id="Content">
    {#await accountsPromise}
      <p>Loading...</p>
    {:then accountsData}
      <div id="Account">
        <h1 id="Header">ATProto PDS</h1>
        <p>Home to {accountsData.length} accounts</p>
        <div id="accountsList">
          {#each accountsData as accountObject}
            <AccountComponent account={accountObject} />
          {/each}
        </div>
        <p>{@html Config.FOOTER_TEXT}</p>
      </div>
    {:catch error}
      <p>Error: {error.message}</p>
    {/await}

    <div id="Feed">
      <div id="spacer"></div>
      {#each posts as postObject}
        <PostComponent post={postObject as Post} />
      {/each}
        <InfiniteLoading on:infinite={onInfinite} distance={3000} />
      <div id="spacer"></div>
    </div>
  </div>
</main>

<style>
 
</style>
