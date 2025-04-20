<script lang="ts">
  import PostComponent from "./lib/PostComponent.svelte";
  import AccountComponent from "./lib/AccountComponent.svelte";
  import { fetchAllPosts, Post, getAllMetadataFromPds } from "./lib/pdsfetch";
  const postsPromise = fetchAllPosts();
  const accountsPromise = getAllMetadataFromPds();
</script>

<main>
  <h1>Welcome to the Feed</h1>
  {#await accountsPromise}
    <p>Loading...</p>
  {:then accountsData}
    <div id="Account">
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
</main>

<style>
</style>
