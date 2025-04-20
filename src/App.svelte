<script lang="ts">
  import PostComponent from "./lib/PostComponent.svelte";
  import AccountComponent from "./lib/AccountComponent.svelte";
  import { fetchAllPosts, Post, getAllMetadataFromPds } from "./lib/pdsfetch";
  const postsPromise = fetchAllPosts();
  const accountsPromise = getAllMetadataFromPds();
</script>

<main>
  <div id="Content">
  {#await accountsPromise}
    <p>Loading...</p>
  {:then accountsData}
    <div id="Account">
      <h1 id="Header">ATProto PDS</h1>
      <p>Home to {accountsData.length} accounts</p>
      {#each accountsData as accountObject}
        <AccountComponent account={accountObject} />
      {/each}
    </div>
  {:catch error}
    <p>Error: {error.message}</p>    
  {/await}

  {#await postsPromise}
    <p>Loading...</p>
  {:then postsData}
    <div id="Feed">
      {#each postsData as postObject}
        <PostComponent post={postObject as Post} />
      {/each}
    </div>
  {/await}
  </div>
</main>

<style>
  #Content {
    display: flex;
    /* split the screen in half, left for accounts, right for posts */
    width: 100%;
    height: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: #12082b;
    color: #ffffff;
  }
  #Feed {
    width: 65%;
    height: 80vh;
    overflow-y: scroll;
    padding: 20px;
  }
  #Account {
    width: 35%;
    height: 80vh;
    overflow-y: scroll;
    padding: 20px;
    background-color: #070311;

    border-radius: 10px;
  }
  #Header {
    text-align: center;
    font-size: 2em;
    margin-bottom: 20px;
  }
</style>
