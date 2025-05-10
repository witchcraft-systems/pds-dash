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
  /* desktop style */

  #Content {
    display: flex;
    /* split the screen in half, left for accounts, right for posts */
    width: 100%;
    height: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: var(--background-color);
    color: var(--text-color);
  }
  #Feed {
    overflow-y: scroll;
    width: 65%;
    height: 100vh;
    padding: 20px;
    padding-bottom: 0;
    padding-top: 0;
    margin-top: 0;
    margin-bottom: 0;
  }
  #spacer {
    padding: 0;
    margin: 0;
    height: 10vh;
    width: 100%;
  }
  #Account {
    width: 35%;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
    background-color: var(--content-background-color);
    height: 80vh;
    padding: 20px;
    margin-left: 20px;
  }
  #accountsList {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    height: 100%;
    width: 100%;
    padding: 0px;
    margin: 0px;
  }

  #Header {
    text-align: center;
    font-size: 2em;
    margin-bottom: 20px;
  }

  /* mobile style */
  @media screen and (max-width: 600px) {
    #Content {
      flex-direction: column;
      width: auto;
      padding-left: 0px;
      padding-right: 0px;
      margin-top: 5%;
    }
    #Account {
      width: 85%;
      padding-left: 5%;
      padding-right: 5%;
      margin-bottom: 20px;
      margin-left: 5%;
      margin-right: 5%;
      height: auto;
    }
    #Feed {
      width: 95%;
      margin: 0px;
      margin-left: 10%;
      margin-right: 10%;
      padding: 0px;
      overflow-y: visible;
    }

    #spacer {
      height: 0;
    }
  }
</style>
