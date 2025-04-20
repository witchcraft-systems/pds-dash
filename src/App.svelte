<script lang="ts">
  import PostComponent from "./lib/PostComponent.svelte";
  import { fetchAllPosts, Post } from "./lib/pdsfetch";
  const postsPromise = fetchAllPosts();
</script>

<main>
  {#await postsPromise}
    <p>Loading...</p>
  {:then postsData}
    {#each postsData as postObject}
      <PostComponent post={postObject as Post} />
    {/each}
  {/await}
</main>

<style>

</style>
