<script lang="ts">
  import { Post } from "./pdsfetch";
  import { Config } from "../../config";
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
    <div id="headerText">
      <a href="{Config.FRONTEND_URL}/profile/{post.authorDid}"
        >{post.displayName} ( {post.authorHandle} )</a
      >
      |
      <a href="{Config.FRONTEND_URL}/profile/{post.authorDid}/post/{post.cid}"
        >{post.timenotstamp}</a
      >
    </div>
  </div>
  <div id="postContent">
    {#if post.replyingUri}
    <a
      id="replyingText"
      href="{Config.FRONTEND_URL}/profile/{post.replyingUri.repo}/post/{post
        .replyingUri.rkey}">replying to {post.replyingUri.repo}</a
    >
    {/if}
    <div id="postText">{post.text}</div>
    {#if post.quotingUri}
      <a
        id="quotingText"
        href="{Config.FRONTEND_URL}/profile/{post.quotingUri.repo}/post/{post
          .quotingUri.rkey}">quoting {post.quotingUri.repo}</a
      >
    {/if}
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
    margin-bottom: 15px;
    overflow-wrap: break-word;
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
    overflow-wrap: break-word;
  }
  #postContent {
    display: flex;
    text-align: start;
    flex-direction: column;
    padding: 10px;
    background-color: #0d0620;
    color: white;
    overflow-wrap: break-word;
  }
  #replyingText {
    font-size: 0.7em;
    margin: 0;
    padding: 0;
    padding-bottom: 5px;
  }
  #postText {
    margin: 0;
    margin-bottom: 5px;
    padding: 0;
  }
  #headerText {
    margin-left: 10px;
    font-size: 0.9em;
    text-align: start;
    overflow-wrap: break-word;
    overflow: hidden;
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
