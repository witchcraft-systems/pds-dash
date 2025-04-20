<script lang="ts">
  import { Post } from "./pdsfetch";
  let { post }: { post: Post } = $props();
</script>

<div id="postContainer">
  <div id="postHeader">
    {#if post.authorAvatarCid}
      <img
        id="avatar"
        alt="avatar of {post.displayName}"
        src="https://pds.witchcraft.systems/xrpc/com.atproto.sync.getBlob?did={post.authorDid}&cid={post.authorAvatarCid}"
      />
    {/if}
    <p>{post.displayName} | {post.authorHandle} | {post.timenotstamp}</p>
  </div>
  <div id="postContent">
    <p>{post.text}</p>
    {#if post.replyingUri}
      <a
        href="https://deer.social/profile/{post.replyingUri.repo}/post/{post
          .replyingUri.rkey}">Replying to {post.replyingUri.repo}</a
      >
    {/if}
    {#if post.quotingUri}
      <a
        href="https://deer.social/profile/{post.quotingUri.repo}/post/{post
          .quotingUri.rkey}">Quoting {post.quotingUri.repo}</a
      >
    {/if}
    {#if post.imagesCid}
      <div id="imagesContainer">
        {#each post.imagesCid as imageLink}
          <img
            id="embedImages"
            alt="Post Image"
            src="https://pds.witchcraft.systems/xrpc/com.atproto.sync.getBlob?did={post.authorDid}&cid={imageLink}"
          />
        {/each}
      </div>
    {/if}
    {#if post.videosLinkCid}
      <video
        id="embedVideo"
        src="https://pds.witchcraft.systems/xrpc/com.atproto.sync.getBlob?did={post.authorDid}&cid={post.videosLinkCid}"
      />
    {/if}
  </div>
</div>

<style>
  #postContainer {
    display: column;
    text-align: start;
    border: 2px solid black;
    padding: 4%;
  }
  #postHeader {
    text-decoration: underline;
  }
  #avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }
  #embedImages {
    width: 50%;
    height: 50%;
  }
</style>
