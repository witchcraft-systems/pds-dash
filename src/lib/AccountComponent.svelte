<script lang="ts">
    import type { AccountMetadata } from "./pdsfetch";
    const { account }: { account: AccountMetadata } = $props();
</script>
<div id="accountContainer">
        {#if account.avatarCid}
            <img
                id="avatar"
                alt="avatar of {account.displayName}"
                src="https://pds.witchcraft.systems/xrpc/com.atproto.sync.getBlob?did={account.did}&cid={account.avatarCid}"
            />
        {/if}
        <p>{account.displayName}</p>
</div>
<style>
    #accountContainer {
        display: column;
        text-align: start;
        border: 2px solid black;
        padding: 4%;
    }
    #avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
    }
</style>