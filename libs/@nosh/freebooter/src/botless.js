import { pragma } from './pragma'
const { NeoNumber, NeoObject } = pragma
const botmatchers = new NeoObject({
  dont_be_google: /google|Ads/i, // Googlebot
  microsoft_ip_thievery_engine: /bingbot/i, // Bingbot
  openweb_annoyance: /OpenWeb/i, // OpenWeb
  intellectual_property_thievery_gpt: /GPT/i, // OpenAI
  search_engine_pointless_everywhere_but_japan: /slurp/i, // Yahoo! Slurp
  bugman_chinkspider: /baidu/i, // Baidu
  ex_russian_serbian_spiderbot: /yandex/i, // Yandex
  microsoft_pretending_to_be_anonymous_bot: /duckduck/i, // DuckDuckGo
  zuccbot: /facebookexternal/i, // Facebook
  elonbot: /twitter/i, // Twitter
  sunnyvale_recruiting_monopoly_bot: /linkedin/i, // LinkedIn
  local_social_mobile_bot: /pinterest/i, // Pinterest
  atlassian_content_embed: /slackbot/i, // Slack
  jira_content_embed: /Jira/i, // Jira
  telegrambot: /telegrambot/i, // Telegram
  applebot: /applebot/i, // Apple
  whats_facebook_in_disguise_bot: /whatsapp/i, // WhatsApp
  skypebot: /skypeuripreview/i, // Skype
  cashapp_with_chinese_characteristics: /line/i, // LINE
  discord_jannybot: /discordbot/i, // Discord
  zoombot: /zoominfo/i, // Zoom
  genericbot: /bot|crawl|spider/i, // Generic bots
  internet_dick_measurer: /InternetMeasurement/,
  dc_politician_archive: /archive/i,
  ahrefs: /Ahrefs/i,
  best_minds_at_mj12: /MJ12/,
  cen_syster_marriage: /CensysInspect/i,
  zerg_rush: /SemrushBot/i,
  loic: /lo(?:w.*orbita?l?.*)i(?:on\s*)cannon/i,
  hello_go_away: /Hello\s+World/i,
  this_psycho: /Chrome\/81\.0\.4044\.129/,
  gavrilo_princip: /xfa1\,nvdorz\.nvd0rz/i,
  no_useragent: /^$/,
  dude_in_basement: /Custom-AsyncHttpClient/,
  palo_alto_networks: /scaninfo/,
  vikingposters: /SM-T\d+\s*Build\/KOT/,
  obvious_chinaposters: /zh\-CN/i,
  obvious_russiaposters: /ru\-RU/i,
  practice_pyscrape_elsewhere: /python\-requests/,
  edgelords: /Edg\/\d+/,
  wow_no_thanks: /WOW64/,
  chinese_hack_factory: /Infinix\s*X\w+\s*Build/,
  hurr_durr_huehue: /hu\;\s*rv/,
  chinese_cyberattack: /[\x00 - \x08\x0E - \x1F\x7F]/,
  chinese_cyberattack2: /[\x80 - \xFF]/,
  peoples_liberation_army: /^[\x16][\x03][\x01 ]/,
  yuropoors: /[\xC0-\xFF]/i,
})


const suspect_uris = new NeoObject({
  envfile_varset_thieves: /\.env\w*$/,
  zoo_escape_attempt: /\/?(\.{2}\/)+/, // index.php?lang=../../..
  php_autoprepend_fuckery: /auto_prepend_file.*php.+input/,
  shell_injection: /.*\/bin\/\w{0,3}sh/,
  admin_access: /\/admin\//,
  password_evasion: /\'\s*\=\s*\'|\"\s*\=\s*\"/,
  eval_fags: /eval-stdin/,
  eval_exec_fags: /eval\W+|exec\W+/,
  syscall_attempt: /call_user_func\w*/,
  function_passing: /function\=/,
  fresh_out_of_box: /sample\.env/,
  env_expnsion: /\.env\.\w+/,
  dotfile_script_kiddays: /\.[\w\-\/\\]+/,
  party_like_its_1999: /phpinfo/,
  not_creative: /\/remote\W*login/,
  when_will_they_ever_learn: /\/de(?:ploy|liver|pendenc|fault|veloper)\w*\/\./,
  chinese_bots: /^(\\x[a-f0-9]{2}){3,21}/,
  ccp_leet_hackers: /\x918\s*\xF4_kr\xC9\]/,
});


const error_code_pairs = new NeoObject({
  payment_required: 402,
  slow_the_fuck_down: 420,
  back_to_the_shortbus: 406,
  this_is_war: 409,
  you_win___psych: 410,
  so_tiny: 411,
  i_expected_better: 417,
  you_have_a_legally_recognized_disability: 451,
  its_on_fire: 218,
  too_hot_for_windows_98: 450,
  gfy: 299,
});


const botMatches = (req) => {
  const ua = req.headers["User-Agent"] ?? "";
  return botmatchers.filter((k, v) => (v.test(ua) ? k : null)).compact; // type narray
};
const enlist = (...args)=> new pragma.NeoNumber(args)
const isBot = (req) =>  botMatches(req).length > 0
const unsafeRequestProbability = (req) => {
  const uri = enlist(req.protocol, "://", req.uri.host, req.originalUrl).join;
  const suspicious = enlist(suspect_uris.filter((k, v) => v.test(uri)).keys);
  // one match is suspicious, more is very suspect_uris
  return new NeoNumber(suspicious.length ** 2).sigmoid;
};

const blockUnsafe = (req) => {
  return unsafeRequestProbability(req) > 0.05
}

const randomErrorStatus = () => {
  const key = error_code_pairs.keys.random
  return { code: error_code_pairs[key], type: key };
};

// botless middleware in etc - pass the botless config object to botless
/*
    "botless": {
      "enabled": true,
      "options": {
        "whitelisted": ["curl", "node-fetch", "axios", "faraday", "httparty"],
        "allowWithHeader": "X-Nosh-Graybin",
        "denyBadActors": "always",
        "behavior": "standard",
        "description": "Standard middleware sends a random error code on route fetch."
      }
    },
*/
const botless = (bunserver, request) => {
  const config = { enabled: true, whitelisted: [], allowWithHeader: "", denyBadActors: "always", behavior: "standard", ...(bunserver.config.middleware.botless ?? {}) }
  const { enabled, whitelisted, allowWithHeader, denyBadActors, behavior } = config
  if ((whitelisted??[]).includes(request.headers['User-Agent'])) return 'next'
  if (!enabled) return 'next'
  if (allowWithHeader && request.headers[allowWithHeader]) return { code: 200, type: "OK" }
  if (isBot(request)) {
    if (denyBadActors === "always") return { code: 403, type: "Forbidden" }
    if (denyBadActors === "unsafe" && blockUnsafe(request)) return { code: 403, type: "Forbidden" }
    if (behavior === "standard") return randomErrorStatus()
    return 'next'
  }
}

export { isBot, botMatches, randomErrorStatus, unsafeRequestProbability, blockUnsafe, botless }
