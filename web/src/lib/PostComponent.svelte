<script lang="ts">
  import { Post } from "./pdsfetch";
  let { post } : { post : Post } = $props();
</script>

<div>
  <p>{post.displayName} | {post.timenotstamp}</p>
  <p>{post.text}</p>
  {#if post.replyingDid}
    <p>Replying to: {post.replyingDid}</p>
  {/if}
  {#if post.imagesLinksCid}
    {#each post.imagesLinksCid as imageLink}
      <img src="https://pds.witchcraft.systems/xrpc/com.atproto.sync.getBlob?did={post.authorDid}&cid={imageLink}" />
    {/each}
  {/if}
  {#if post.videosLinkCid}
    <video src="https://pds.witchcraft.systems/xrpc/com.atproto.sync.getBlob?did={post.authorDid}&cid={post.videosLinkCid}" />
  {/if}
  
</div>