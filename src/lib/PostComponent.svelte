<script lang="ts">
  import { Post } from "./pdsfetch";
  import { Config } from "../../config"
  let { post }: { post: Post } = $props();
</script>

<div id="postContainer">
  <div id="postHeader">
    {#if post.authorAvatarCid}
      <img
        id="avatar"
        src="{Config.PDS_URL}/xrpc/com.atproto.sync.getBlob?did={post.authorDid}&cid={post.authorAvatarCid}"
        alt="avatar of {post.displayName}"
      />
    {/if}
    <div id="headerText">{post.displayName} | {post.timenotstamp}</div>
  </div>
  <div id="postContent">
    {#if post.replyingDid}
    <p id="replyingText">replying to: {post.replyingDid}</p>
  {/if}
    <p id="postText">{post.text}</p>
    {#if post.imagesCid}
      <div id="imagesContainer">
        {#each post.imagesCid as imageLink}
          <img
            id="embedImages"
            alt="Post Image"
            src="{Config.PDS_URL}/xrpc/com.atproto.sync.getBlob?did={post.authorDid}&cid={imageLink}"
          />
        {/each}
      </div>
    {/if}
    {#if post.videosLinkCid}
      <video
        id="embedVideo"
        src="{Config.PDS_URL}/xrpc/com.atproto.sync.getBlob?did={post.authorDid}&cid={post.videosLinkCid}"
      />
    {/if}
  </div>
</div>

<style>
  #postContainer {
    display: flex;
    flex-direction: column;
    border: 1px solid #8054f0;
    background-color: black;
    margin-bottom: -1px;
  }
  #postHeader {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    background-color: #1f1145;
    padding: 0px 0px;
    height: fit-content;
    border-bottom: 1px solid #8054f0;
    font-weight: bold;
  }
  #postContent {
    display: flex;
    text-align: start;
    flex-direction: column;
    padding: 10px;
    background-color: #0d0620;
    color: white;
  }
  #replyingText {
    font-size: 0.7em;
    color: white;
    margin: 0;
    margin-bottom: 10px;
    padding: 0;
  }
  #postText {
    margin: 0;
    padding: 0;
  }
  #headerText {
    margin-left: 10px;
    font-size: 0.9em;
    text-align: start;
  }
  #avatar {
    width: 50px;
    height: 50px;
    margin: 0px;
    margin-left: 0px;
    border-right: #8054f0 1px solid;
  }
  #embedImages {
    width: 50%;
    height: 50%;
    margin-top: 0px;
    margin-bottom: -5px;
  }
  #embedVideo {
    width: 50%;
    height: 50%;
  }
</style>
