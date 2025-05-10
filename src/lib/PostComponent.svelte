<script lang="ts">
  import { Post } from "./pdsfetch";
  import { Config } from "../../config";
  import { onMount } from "svelte";
  import moment from "moment";

  let { post }: { post: Post } = $props();

  // State for image carousel
  let currentImageIndex = $state(0);

  // Functions to navigate carousel
  function nextImage() {
    if (post.imagesCid && currentImageIndex < post.imagesCid.length - 1) {
      currentImageIndex++;
    }
  }

  function prevImage() {
    if (currentImageIndex > 0) {
      currentImageIndex--;
    }
  }

  // Function to preload an image
  function preloadImage(index: number): void {
    if (!post.imagesCid || index < 0 || index >= post.imagesCid.length) return;

    const img = new Image();
    img.src = `${Config.PDS_URL}/xrpc/com.atproto.sync.getBlob?did=${post.authorDid}&cid=${post.imagesCid[index]}`;
  }

  // Preload adjacent images when current index changes
  $effect(() => {
    if (post.imagesCid && post.imagesCid.length > 1) {
      // Preload next image if available
      if (currentImageIndex < post.imagesCid.length - 1) {
        preloadImage(currentImageIndex + 1);
      }

      // Preload previous image if available
      if (currentImageIndex > 0) {
        preloadImage(currentImageIndex - 1);
      }
    }
  });

  // Initial preload of images
  onMount(() => {
    if (post.imagesCid && post.imagesCid.length > 1) {
      // Preload the next image if it exists
      if (post.imagesCid.length > 1) {
        preloadImage(1);
      }
    }
  });
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
      <a id="displayName" href="{Config.FRONTEND_URL}/profile/{post.authorDid}"
        >{post.displayName}</a
      >
      <p id="handle">
        <a href="{Config.FRONTEND_URL}/profile/{post.authorHandle}"
          >{post.authorHandle}</a
        >

        <a
          id="postLink"
          href="{Config.FRONTEND_URL}/profile/{post.authorDid}/post/{post.recordName}"
          >{moment(post.timenotstamp).isBefore(moment().subtract(1, "month"))
            ? moment(post.timenotstamp).format("MMM D, YYYY")
            : moment(post.timenotstamp).fromNow()}</a
        >
      </p>
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
    {#if post.quotingUri}
      <a
        id="quotingText"
        href="{Config.FRONTEND_URL}/profile/{post.quotingUri.repo}/post/{post
          .quotingUri.rkey}">quoting {post.quotingUri.repo}</a
      >
    {/if}
    <div id="postText">{post.text}</div>
    {#if post.imagesCid && post.imagesCid.length > 0}
      <div id="carouselContainer">
        <img
          id="embedImages"
          alt="Post Image {currentImageIndex + 1} of {post.imagesCid.length}"
          src="{Config.PDS_URL}/xrpc/com.atproto.sync.getBlob?did={post.authorDid}&cid={post
            .imagesCid[currentImageIndex]}"
        />

        {#if post.imagesCid.length > 1}
          <div id="carouselControls">
            <button
              id="prevBtn"
              onclick={prevImage}
              disabled={currentImageIndex === 0}>←</button
            >
            <div id="carouselIndicators">
              {#each post.imagesCid as _, i}
                <div
                  class="indicator {i === currentImageIndex ? 'active' : ''}"
                ></div>
              {/each}
            </div>
            <button
              id="nextBtn"
              onclick={nextImage}
              disabled={currentImageIndex === post.imagesCid.length - 1}
              >→</button
            >
          </div>
        {/if}
      </div>
    {/if}
    {#if post.videosLinkCid}
      <!-- svelte-ignore a11y_media_has_caption -->
      <video
        id="embedVideo"
        src="{Config.PDS_URL}/xrpc/com.atproto.sync.getBlob?did={post.authorDid}&cid={post.videosLinkCid}"
        controls
      ></video>
    {/if}
  </div>
</div>

<style>
  a:hover {
    text-decoration: underline;
  }
  #postContainer {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
    margin-bottom: 15px;
    overflow-wrap: break-word;
  }
  #postHeader {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    background-color: var(--header-background-color);
    padding: 0px 0px;
    height: fit-content;
    border-bottom: 1px solid var(--border-color);
    font-weight: bold;
    overflow-wrap: break-word;
    height: 60px;
  }
  #displayName {
    display: block;
    color: var(--text-color);
    font-size: 1.2em;
    padding: 0;
    margin: 0;
    overflow-wrap:normal;
    word-wrap: break-word;
    word-break: break-word;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
  }
  #handle {
    display: block;
    color: var(--border-color);
    font-size: 0.8em;
    padding: 0;
    margin: 0;
  }

  #postLink {
    color: var(--border-color);
    font-size: 0.8em;
    padding: 0;
    margin: 0;
  }
  #postContent {
    display: flex;
    text-align: start;
    flex-direction: column;
    padding: 10px;
    background-color: var(--content-background-color);
    color: var(--text-color);
    overflow-wrap: break-word;
    white-space: pre-line;
  }
  #replyingText {
    font-size: 0.7em;
    margin: 0;
    padding: 0;
    padding-bottom: 5px;
  }
  #quotingText {
    font-size: 0.7em;
    margin: 0;
    padding: 0;
    padding-bottom: 5px;
  }
  #postText {
    margin: 0;
    padding: 0;
    overflow-wrap: break-word;
    word-wrap: normal;
    word-break: break-word;
    hyphens: none;
  }
  #headerText {
    margin-left: 10px;
    font-size: 0.9em;
    text-align: start;
    word-break: break-word;
    max-width: 80%;
    max-height: 95%;
    overflow: hidden;
    align-self: flex-start;
    margin-top: auto;
    margin-bottom: auto;
  }
  #avatar {
    height: 60px;
    width: 60px;
    margin: 0px;
    margin-left: 0px;
    overflow: hidden;
    object-fit: cover;
    border-right: var(--border-color) 1px solid;
  }
  #carouselContainer {
    position: relative;
    width: 100%;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  #carouselControls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 500px;
    margin-top: 5px;
  }
  #carouselIndicators {
    display: flex;
    gap: 5px;
  }
  .indicator {
    width: 8px;
    height: 8px;
    background-color: var(--indicator-inactive-color);
  }
  .indicator.active {
    background-color: var(--indicator-active-color);
  }
  #prevBtn,
  #nextBtn {
    background-color: rgba(31, 17, 69, 0.7);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    width: 30px;
    height: 30px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #prevBtn:disabled,
  #nextBtn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  #embedVideo {
    width: 100%;
    max-width: 500px;
    margin-top: 10px;
    align-self: center;
  }

  #embedImages {
    min-width: min(100%, 500px);
    max-width: min(100%, 500px);
    max-height: 500px;
    object-fit: contain;

    margin: 0;
  }
</style>
