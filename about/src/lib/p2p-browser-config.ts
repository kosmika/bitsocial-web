// Configures @pkcprotocol/pkc-js to run as a browser-libp2p client.
// Mirrors the browser option shape in 5chan's `src/lib/p2p-browser-config.ts`.
//
// `defaultPkcOptions` is read by @bitsocial/bitsocial-react-hooks when it
// lazily constructs its first PKC client, so we attach the options to `window`
// before React mounts instead of introducing a provider component here.

export const PURE_P2P_BROWSER_SETTING_KEY = "bitsocial:blog:pure-p2p-browser-enabled";
const BROWSER_PURE_P2P_DEFAULT_ENABLED = true;

const BROWSER_PUBSUB_KUBO_RPC_CLIENTS_OPTIONS = [
  "https://pubsubprovider.xyz/api/v0",
  "https://plebpubsub.xyz/api/v0",
  "https://rannithepleb.com/api/v0",
];

// Keep this aligned with bitsocial-react-hooks' DEFAULT_HTTP_ROUTER_URLS without
// relying on a package-internal runtime import before window.defaultPkcOptions
// is configured.
export const DEFAULT_HTTP_ROUTER_URLS = [
  "https://peers.pleb.bot",
  "https://routing.lol",
  "https://peers.forumindex.com",
  "https://peers.plebpubsub.xyz",
  "https://routerofbitsocial.xyz",
  "https://bsotracker.online",
];

const LEGACY_DEFAULT_HTTP_ROUTER_URL_SETS = [
  [
    "https://peers.plebpubsub.xyz",
    "https://routing.lol",
    "https://peers.pleb.bot",
    "https://peers.forumindex.com",
  ],
  ["https://peers.plebpubsub.xyz", "https://routing.lol", "https://peers.pleb.bot"],
];

const P2P_BROWSER_PKC_OPTIONS = {
  libp2pJsClientsOptions: [{ key: "libp2pjs" }],
  ipfsGatewayUrls: undefined,
  kuboRpcClientsOptions: undefined,
  pubsubHttpClientsOptions: undefined,
  pubsubKuboRpcClientsOptions: undefined as string[] | undefined,
  httpRoutersOptions: DEFAULT_HTTP_ROUTER_URLS,
};

const GATEWAY_BROWSER_PKC_OPTIONS = {
  ipfsGatewayUrls: [
    "https://ipfsgateway.xyz",
    "https://gateway.plebpubsub.xyz",
    "https://gateway.forumindex.com",
  ],
  kuboRpcClientsOptions: undefined,
  libp2pJsClientsOptions: undefined,
  pubsubHttpClientsOptions: undefined,
  pubsubKuboRpcClientsOptions: BROWSER_PUBSUB_KUBO_RPC_CLIENTS_OPTIONS,
  httpRoutersOptions: DEFAULT_HTTP_ROUTER_URLS,
};

export type P2PBrowserConfigWindow = {
  defaultPkcOptions?: Record<string, unknown>;
  electronApi?: { isElectron?: boolean };
  isElectron?: boolean;
  localStorage?: Pick<Storage, "getItem" | "setItem">;
};

const getDefaultBrowserConfigWindow = () =>
  typeof window === "undefined" ? undefined : (window as unknown as P2PBrowserConfigWindow);

const cloneArray = <T>(value: T[] | undefined) => (value ? [...value] : undefined);

const getUniqueTrimmedUrls = (urls: string[] | undefined) =>
  urls?.reduce<string[]>((uniqueUrls, url) => {
    const trimmedUrl = url.trim();
    if (trimmedUrl && !uniqueUrls.includes(trimmedUrl)) uniqueUrls.push(trimmedUrl);
    return uniqueUrls;
  }, []) ?? [];

const hasSameUrlSet = (urls: string[], comparisonUrls: string[]) =>
  urls.length === comparisonUrls.length && urls.every((url) => comparisonUrls.includes(url));

const hasUrlSet = (urls: string[], comparisonUrls: string[]) =>
  comparisonUrls.every((url) => urls.includes(url));

const isKnownDefaultHttpRoutersOptions = (httpRoutersOptions: string[]) => {
  if (hasSameUrlSet(httpRoutersOptions, DEFAULT_HTTP_ROUTER_URLS)) return true;
  if (
    LEGACY_DEFAULT_HTTP_ROUTER_URL_SETS.some((legacyRouters) =>
      hasSameUrlSet(httpRoutersOptions, legacyRouters),
    )
  ) {
    return true;
  }

  return (
    httpRoutersOptions.every((routerUrl) => DEFAULT_HTTP_ROUTER_URLS.includes(routerUrl)) &&
    LEGACY_DEFAULT_HTTP_ROUTER_URL_SETS.some((legacyRouters) =>
      hasUrlSet(httpRoutersOptions, legacyRouters),
    )
  );
};

export const getBrowserHttpRoutersOptionsWithCurrentDefaults = (
  httpRoutersOptions: string[] | undefined,
) => {
  const httpRouters = getUniqueTrimmedUrls(httpRoutersOptions);
  if (httpRouters.length === 0 || !isKnownDefaultHttpRoutersOptions(httpRouters)) return undefined;

  const missingDefaultHttpRoutersOptions = DEFAULT_HTTP_ROUTER_URLS.filter(
    (routerUrl) => !httpRouters.includes(routerUrl),
  );

  return missingDefaultHttpRoutersOptions.length
    ? [...httpRouters, ...missingDefaultHttpRoutersOptions]
    : undefined;
};

export function getBrowserPureP2PPkcOptions() {
  return {
    ...P2P_BROWSER_PKC_OPTIONS,
    libp2pJsClientsOptions: P2P_BROWSER_PKC_OPTIONS.libp2pJsClientsOptions.map((options) => ({
      ...options,
    })),
    pubsubKuboRpcClientsOptions: cloneArray(P2P_BROWSER_PKC_OPTIONS.pubsubKuboRpcClientsOptions),
    httpRoutersOptions: [...P2P_BROWSER_PKC_OPTIONS.httpRoutersOptions],
  };
}

export function getBrowserGatewayPkcOptions() {
  return {
    ...GATEWAY_BROWSER_PKC_OPTIONS,
    ipfsGatewayUrls: [...GATEWAY_BROWSER_PKC_OPTIONS.ipfsGatewayUrls],
    pubsubKuboRpcClientsOptions: [...GATEWAY_BROWSER_PKC_OPTIONS.pubsubKuboRpcClientsOptions],
    httpRoutersOptions: [...GATEWAY_BROWSER_PKC_OPTIONS.httpRoutersOptions],
  };
}

export function getPureP2PBrowserPreference(
  targetWindow: P2PBrowserConfigWindow | undefined = getDefaultBrowserConfigWindow(),
) {
  try {
    const storedValue = targetWindow?.localStorage?.getItem(PURE_P2P_BROWSER_SETTING_KEY);
    if (storedValue === "true") return true;
    if (storedValue === "false") return false;
  } catch {
    return undefined;
  }

  return undefined;
}

export function setPureP2PBrowserPreference(
  enabled: boolean,
  targetWindow: P2PBrowserConfigWindow | undefined = getDefaultBrowserConfigWindow(),
) {
  try {
    targetWindow?.localStorage?.setItem(PURE_P2P_BROWSER_SETTING_KEY, String(enabled));
  } catch {
    return;
  }
}

export const isElectronRuntime = (
  targetWindow: P2PBrowserConfigWindow | undefined = getDefaultBrowserConfigWindow(),
) => targetWindow?.electronApi?.isElectron === true || targetWindow?.isElectron === true;

export const canUsePureP2PBrowser = (
  targetWindow: P2PBrowserConfigWindow | undefined = getDefaultBrowserConfigWindow(),
) => Boolean(targetWindow) && !isElectronRuntime(targetWindow);

export function shouldUsePureP2PBrowser(
  targetWindow: P2PBrowserConfigWindow | undefined = getDefaultBrowserConfigWindow(),
) {
  if (!canUsePureP2PBrowser(targetWindow)) return false;

  const preference = getPureP2PBrowserPreference(targetWindow);
  if (preference !== undefined) return preference;

  return BROWSER_PURE_P2P_DEFAULT_ENABLED;
}

export function configureP2PBrowserPkcOptions(
  targetWindow: P2PBrowserConfigWindow | undefined = getDefaultBrowserConfigWindow(),
) {
  if (!targetWindow) return false;

  const pureP2PEnabled = shouldUsePureP2PBrowser(targetWindow);

  if (!pureP2PEnabled) {
    if (canUsePureP2PBrowser(targetWindow)) {
      targetWindow.defaultPkcOptions = {
        ...targetWindow.defaultPkcOptions,
        ...getBrowserGatewayPkcOptions(),
      };
    }

    return false;
  }

  targetWindow.defaultPkcOptions = {
    ...targetWindow.defaultPkcOptions,
    ...getBrowserPureP2PPkcOptions(),
  };
  return true;
}
