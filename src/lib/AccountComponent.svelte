<script lang="ts">
  import type { AccountMetadata } from "./pdsfetch";
  const { account }: { account: AccountMetadata } = $props();
  import { Config } from "../../config";
</script>

<a id="link" href="{Config.FRONTEND_URL}/profile/{account.did}">
  <div id="accountContainer">
    {#if account.avatarCid}
      <img
        id="avatar"
        alt="avatar of {account.displayName}"
        src="{Config.PDS_URL}/xrpc/com.atproto.sync.getBlob?did={account.did}&cid={account.avatarCid}"
      />
    {/if}
    <div id="accountName">
      {account.displayName || account.handle || account.did}
    </div>
  </div>
</a>

<style>
  #accountContainer {
    display: flex;
    text-align: start;
    align-items: center;
    background-color: #12082b;
    padding: 0px;
    margin-bottom: 15px;
    border: 1px solid #8054f0;
  }
  #accountName {
    margin-left: 10px;
    font-size: 0.9em;

    /* replace overflow with ellipsis */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 80%;
  }
  #avatar {
    width: 50px;
    height: 50px;
    margin: 0px;
    border-right: #8054f0 1px solid;
  }
</style>
