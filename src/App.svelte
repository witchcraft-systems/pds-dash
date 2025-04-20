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
      <div id="accountsList">
      {#each accountsData as accountObject}
        <AccountComponent account={accountObject} />
      {/each}
      </div>
    </div>
  {:catch error}
    <p>Error: {error.message}</p>    
  {/await}

  {#await postsPromise}
    <p>Loading...</p>
  {:then postsData}
    <div id="Feed">
      <div id="spacer"></div>
      {#each postsData as postObject}
        <PostComponent post={postObject as Post} />
      {/each}
      <div id="spacer"></div>
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
    height: 100vh;
    overflow-y: scroll;
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
    border: 1px solid #8054f0;
    background-color: #0d0620;
    height: 80vh;
    padding: 20px;
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
</style>
