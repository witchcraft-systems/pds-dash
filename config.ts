/**
 * Configuration module for the PDS Dashboard
 */
export class Config {
    /**
     * The base URL of the PDS (Personal Data Server)
     * @default "https://pds.witchcraft.systems"
     */
    static readonly PDS_URL: string = "https://pds.witchcraft.systems";

    /**
     * The base URL of the frontend service for linking to replies
     * @default "https://deer.social"
     */
    static readonly FRONTEND_URL: string = "https://deer.social";

    /**
     * Maximum number of posts to fetch from the PDS per user
     * @default 10
     */
    static readonly MAX_POSTS_PER_USER: number = 22;

    /**
     * Footer text for the dashboard
     * @default "Astrally projected from witchcraft.systems"
     */
    static readonly FOOTER_TEXT: string = "Astrally projected from <a href='https://witchcraft.systems' target='_blank'>witchcraft.systems</a>";
}