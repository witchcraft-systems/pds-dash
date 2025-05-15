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
          >@{post.authorHandle}</a
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
    {#if post.gifLink}
      <img
        id="embedVideo"
        src="{post.gifLink}"
        alt="Post GIF"
      />
    {/if}
  </div>
</div>

<style>

</style>
