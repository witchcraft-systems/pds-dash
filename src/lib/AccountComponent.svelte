<script lang="ts">
    import type { AccountMetadata } from "./pdsfetch";
    const { account }: { account: AccountMetadata } = $props();
    import { Config } from "../../config";
</script>
<div id="accountContainer">
        {#if account.avatarCid}
            <img
                id="avatar"
                alt="avatar of {account.displayName}"
                src="{Config.PDS_URL}/xrpc/com.atproto.sync.getBlob?did={account.did}&cid={account.avatarCid}"
            />
        {/if}
        <div id="accountName">{account.displayName || account.did}</div>
</div>
<style>
    #accountContainer {
        display: flex;
        text-align: start;
        align-items: center;
        background-color: #0d0620;
        padding: 4%;
        margin: 10px;

        /* round corners */
        border-radius: 10px;
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
        border-radius: 50%;
    }
</style>