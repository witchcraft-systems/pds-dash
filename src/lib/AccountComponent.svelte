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
    background-color: var(--background-color);
    padding: 0px;
    margin-bottom: 15px;
    border: 1px solid var(--border-color);
  }
  #accountName {
    margin-left: 10px;
    font-size: 0.9em;

    /* replace overflow with ellipsis */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  #avatar {
    width: 50px;
    height: 50px;
    margin: 0px;
    border-right: var(--border-color) 1px solid;
  }
</style>
