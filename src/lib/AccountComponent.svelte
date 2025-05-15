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

</style>
