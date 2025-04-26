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
   * The base URL of the frontend service for linking to replies/quotes/accounts etc.
   * @default "https://deer.social"
   */
  static readonly FRONTEND_URL: string = "https://deer.social";

  /**
   * Maximum number of posts to fetch from the PDS per request
   * Should be around 20 for about 10 users on the pds
   * The more users you have, the lower the number should be
   * since sorting is slow and is done on the frontend
   * @default 20
   */
  static readonly MAX_POSTS: number = 20;

  /**
   * Footer text for the dashboard, you probably want to change this
   */
  static readonly FOOTER_TEXT: string =
    "Astrally projected from <a href='https://witchcraft.systems' target='_blank'>witchcraft.systems</a><br><br><a href='https://git.witchcraft.systems/scientific-witchery/pds-dash' target='_blank'>Source</a> (<a href='https://github.com/witchcraft-systems/pds-dash/' target='_blank'>github mirror</a>)";

  /**
   * Whether to show the posts that are in the future
   * @default false
   */
  static readonly SHOW_FUTURE_POSTS: boolean = false;
}
