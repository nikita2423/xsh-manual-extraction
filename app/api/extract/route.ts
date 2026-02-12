export async function POST(request: Request) {
  try {
    const { input, timezone } = await request.json();
    const prompt = `
    You are transforming WhatsApp chat logs into structured JSON objects.
    Follow these rules exactly:

    •⁠  ⁠Extraction window (IMPORTANT)
    Only extract posts whose WhatsApp timestamp is within the last 14 days relative to the time of processing.
    •⁠  ⁠If a message is older than 14 days, ignore it completely.
    •⁠  ⁠If the timestamp cannot be parsed, ignore the message.
    •⁠  ⁠Which messages to extract
    Only extract messages that meet ALL of the following:
    •⁠  ⁠Platform is 小红书 / Xiaohongshu / XHS
    •⁠  ⁠Contains a post title (the line after “小红书:” or “小紅書：”)
    •⁠  ⁠Contains a URL (xhslink.com or xiaohongshu.com)
    •⁠  ⁠Timestamp is within the last 14 days
    •⁠  Considering current timezone is ${timezone}
    Ignore:
    •⁠  ⁠Comments
    •⁠  ⁠Deleted messages
    •⁠  ⁠Non-XHS platforms (Douyin, Facebook, HKDiscuss, etc.)
    •⁠  ⁠Any message older than 14 days
    •⁠  ⁠Fields to extract
    From each valid WhatsApp message, extract:
    •⁠  ⁠Timestamp (HK time)
    •⁠  ⁠Post title
    •⁠  ⁠Post message
    •⁠  ⁠URL (keep the url as it is while extraction)
    •⁠  ⁠Timestamp conversion
    •⁠  comment count
    •⁠  if timestamp cannot be parsed, return null
    WhatsApp timestamps are in ${timezone}.
    Convert to UTC:
    UTC = ${timezone}_time - 8 hours
    Output two timestamp formats:
    •⁠  ⁠ISO8601: YYYY-MM-DDTHH:MM:SSZ
    •⁠  ⁠Unix timestamp: 13-digit milliseconds since epoch (UTC)
    Example:
    [30/12/25, 3:34:56 PM]→ 2025-12-30T10:04:56Z and 1767089096000 in IST timezone

    Compute:
    SHA-256(lowercase(post_link))
    Where:
    •⁠  ⁠Use the exact literal URL from WhatsApp
    •⁠  ⁠Convert the URL to lowercase before hashing
    •⁠  ⁠Do NOT expand redirects
    •⁠  ⁠Do NOT normalize
    •⁠  ⁠Output lowercase hex
    •⁠  ⁠Static fields (same for all posts)
    'author_id': 'xiaohongshu',
    'author_link': 'https://www.xiaohongshu.com',
    'author_name': 'xiaohongshu',
    'channel': 'xiaohongshu',
    'channel_link': 'https://www.xiaohongshu.com',
    'comment_order': 0,
    'country': 'China',
    'is_comment': false,
    'lang_abbr': 'zh-s',
    'medium': 'Social',
    'raw_raw': 'insert_china',
    'site': 'xiaohongshu'
    •⁠  ⁠Dynamic fields (per post)
    post_message = extracted post message
    thread_title = extracted post title
    post_link = extracted URL
    thread_link = same as post_link
    comment_count = extracted comment count
    post_timestamp = ISO8601 UTC
    unix_timestamp = 13-digit Unix timestamp (UTC)
    No line breaks, no indentation.
    Sort entries in reverse chronological order (newest → oldest) based on the WhatsApp timestamp.

    Example post:
    28/12/2025, 18:11 - +852 9837 8608: 小紅書 : 中银香港的申请都搞懵了 (中性)

    中银香港遇到“我们未能处理您的申请，请亲临任何一间分行办理手续。（IJ9060）”应该咋整啊？

    留言 (3)

    •⁠ 22号到现在，一点消息都没有


    Post title - 中银香港的申请都搞懵了
    Post message - 中银香港遇到“我们未能处理您的申请，请亲临任何一间分行办理手续。（IJ9060）”应该咋整啊？


    Example post:
中银香港万事达扣账卡可以直接在海外消费吗 礼貌求问...

礼貌求问友友们 已知这张卡可以直接扣港元储蓄 如果去新加坡/台湾玩刷卡也会直接港元结算吗 会有手续费吗？还是可以直接0手续费直接扣港元储蓄户口 （在考虑要不要换汇）
谢谢[抽泣R][抽泣R][抽泣R]
	
补充：这张卡是拍卡还是插卡呀！
	
#中银香港 #中银香港扣账卡 #香港生活 #新加坡 #master扣账卡 


 http://xhslink.com/o/zwmzZXkSkO 
Copy and open Xiaohongshu to view the full post！

    Post title - 中银香港万事达扣账卡可以直接在海外消费吗 礼貌求问...
    Post message - 礼貌求问友友们 已知这张卡可以直接扣港元储蓄 如果去新加坡/台湾玩刷卡也会直接港元结算吗 会有手续费吗？还是可以直接0手续费直接扣港元储蓄户口 （在考虑要不要换汇）
谢谢[抽泣R][抽泣R][抽泣R]
	
补充：这张卡是拍卡还是插卡呀！
	
#中银香港 #中银香港扣账卡 #香港生活 #新加坡 #master扣账卡 


    Note:
    - If post message cannot be extracted then assign post title to post_message
    - If boc brand is not mentioned in post title, need to assign bochk in post title, add this '中银香港' at the end of post title
    - Do not miss any post related to defined channel above
    - Do not change the casing of extracted url
    - Do not include commnents and sentiment in both post thread_title and post_message
    - Do not use example posts for extraction
    - Do not provide example post as a output

    ────────────────────────────────────────

    *Posts Text to Analyze:*
    ${input}

    Return JSON array in output:
    {[
      {
        "post_link": "<extracted post link>",
        "thread_title": "<extracted post title>",
        "post_message": "<extracted post message>",
        "post_timestamp": "<ISO8601 UTC>",
        "unix_timestamp": "<13-digit Unix timestamp (UTC)>",
        "comment_count": "<Extracted comment count in number>"
      }
    ]}
    `;
    //     const prompt = `
    //      You are transforming ONLY the provided WhatsApp chat log input into structured JSON objects.

    // ABSOLUTE RULES (HIGHEST PRIORITY)
    // - Use ONLY data explicitly present in the input WhatsApp messages.
    // - DO NOT reuse, adapt, paraphrase, or reference any example post shown in this prompt.
    // - DO NOT fabricate, infer, or generate placeholder posts.
    // - If no valid WhatsApp messages meet the criteria, return an empty JSON array: [].
    // - Never include sample data, demo data, or training examples in the output.

    // Extraction Window (MANDATORY)
    // - Only extract posts whose WhatsApp timestamp is within the last 14 days relative to the time of processing.
    // - If a message is older than 14 days, ignore it completely.
    // - If the timestamp cannot be parsed, ignore the message.

    // Messages to Extract (ALL conditions required)
    // - Platform is 小红书 / 小紅書 / Xiaohongshu / XHS
    // - Contains a post title (line immediately after “小红书:” or “小紅書：”)
    // - Contains a URL from xhslink.com or xiaohongshu.com
    // - Timestamp is within the last 14 days
    // - Current timezone is ${timezone}

    // Ignore the Following
    // - Comments or replies
    // - Deleted messages
    // - Non-XHS platforms (Douyin, Facebook, HKDiscuss, etc.)
    // - Messages older than 14 days
    // - Sentiment labels or metadata

    // Fields to Extract (Per Valid Post)
    // - post_message
    // - thread_title
    // - post_link
    // - thread_link (same as post_link)
    // - comment_count
    // - post_timestamp (ISO8601 UTC)
    // - unix_timestamp (13-digit milliseconds UTC)

    // Do NOT guess or infer missing fields.

    // Timestamp Handling
    // - WhatsApp timestamps are in ${timezone}
    // - Convert to UTC using: UTC = ${timezone}_time - 8 hours
    // - Output both:
    //   - ISO8601: YYYY-MM-DDTHH:MM:SSZ
    //   - Unix timestamp: 13-digit milliseconds (UTC)
    // - If timestamp parsing fails, set both timestamps to null

    // Hash Computation
    // Compute SHA-256(lowercase(post_link))
    // - Use the exact literal URL from WhatsApp
    // - Convert URL to lowercase before hashing
    // - Do NOT expand redirects
    // - Do NOT normalize
    // - Output lowercase hex

    // Static Fields (Same for All Posts)
    // author_id: "xiaohongshu"
    // author_link: "https://www.xiaohongshu.com"
    // author_name: "xiaohongshu"
    // channel: "xiaohongshu"
    // channel_link: "https://www.xiaohongshu.com"
    // comment_order: 0
    // country: "China"
    // is_comment: false
    // lang_abbr: "zh-s"
    // medium: "Social"
    // raw_raw: "insert_china"
    // site: "xiaohongshu"

    // Special Rules
    // - If post_message cannot be extracted, assign thread_title to post_message
    // - If 中银香港 is not mentioned in thread_title, append 中银香港 at the end
    // - Do NOT include comments or sentiment text
    // - Do NOT change the casing of extracted URLs
    // - Do NOT miss any post related to the defined channel
    // - Do NOT use example posts for extraction
    // ────────────────────────────────────────
    // *Posts Text to Analyze:*
    // ${input}

    // Return JSON array in output:
    // {[
    //   {
    //     "post_link": "<extracted post link>",
    //     "thread_title": "<extracted post title>",
    //     "post_message": "<extracted post message>",
    //     "post_timestamp": "<ISO8601 UTC>",
    //     "unix_timestamp": "<13-digit Unix timestamp (UTC)>",
    //     "comment_count": "<Extracted comment count in number>"
    //   }
    // ]}
    //      `
    const OPENROUTER_KEY = process.env.OPEN_ROUTER_KEY;
    const schema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          post_link: { type: "string" },
          thread_title: { type: "string" },
          post_message: { type: "string" },
          post_timestamp: { type: "string" }, // ISO8601 UTC
          unix_timestamp: { type: "integer" }, // 13-digit ms timestamp
          comment_count: { type: "integer" },
        },
        required: [
          "post_link",
          "thread_title",
          "post_message",
          "post_timestamp",
          "unix_timestamp",
          "comment_count",
        ],
        additionalProperties: false,
      },
    };

    function extractJsonOrPythonLiteral(text: any) {
      text = text.trim();

      // Try extracting full JSON object or list using regex
      const match = text.match(/(\[.*\]|\{.*\})/s);
      if (!match) return null;

      const snippet = match[1];

      // Try JSON parse first
      try {
        return JSON.parse(snippet);
      } catch (err) {
        // Last-resort fallback — attempt JS eval for Python-style dicts
        try {
          // eslint-disable-next-line no-eval
          return eval(`(${snippet})`);
        } catch (e) {
          return null;
        }
      }
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen3-235b-a22b-2507",
          messages: [{ role: "user", content: prompt }],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "news_data",
              strict: true,
              schema,
            },
          },
          temperature: 0.2,
        }),
      }
    );
    const result = await response.json();
    console.log("Result", result);
    const results: any = [];
    if (!result.error) {
      const batchResult = result.choices?.[0]?.message?.content?.trim();
      console.log("batch_result", batchResult);

      const dataJson = extractJsonOrPythonLiteral(batchResult);
      console.log("data_json", dataJson, typeof dataJson);

      if (Array.isArray(dataJson)) {
        dataJson.forEach((data) => {
          console.log("data", data);
          const now = new Date();
          // UTC ISO format
          const isoUtc = now.toISOString();
          // Unix timestamp (milliseconds)
          const unixMs = now.getTime();
          console.log(isoUtc);
          console.log("Unix Timestamp (ms):", unixMs);
          results.push({
            country: "China",
            lang_abbr: "zh-s",
            medium: "Social",
            site: "xiaohongshu",
            channel: "xiaohongshu",
            channel_link: "https://www.xiaohongshu.com",
            thread_link: data.post_link,
            post_link: data.post_link,
            thread_title: data.thread_title,
            post_message: data.post_message
              ? data.post_message
              : data.thread_title,
            post_timestamp: isoUtc,
            unix_timestamp: unixMs,
            comment_count: data.comment_count,
            author_name: "xiaohongshu",
            author_link: "https://www.xiaohongshu.com",
            author_id: "xiaohongshu",
            is_comment: false,
            comment_order: 0,
            raw_raw: "insert_china",
          });
        });
      }
    }

    // const mockData = {
    //   country: "China",
    //   lang_abbr: "zh-s",
    //   medium: "Social",
    //   site: "xiaohongshu",
    //   channel: "xiaohongshu",
    //   channel_link: "https://www.xiaohongshu.com",
    //   thread_link: "http://xhslink.com/o/25mcmKW9znS",
    //   post_link: "http://xhslink.com/o/25mcmKW9znS",
    //   thread_title:
    //     "12月29号中银香港资料填完秒拒，白跑了三趟香港，能踩...中银香港",
    //   post_message: "12月29号中银香港资料填完秒拒，白跑了三趟香港，能踩...",
    //   post_timestamp: "2025-12-29T08:33:32Z",
    //   unix_timestamp: 1735451612000,
    //   comment_count: 11,
    //   author_name: "xiaohongshu",
    //   author_link: "https://www.xiaohongshu.com",
    //   author_id: "xiaohongshu",
    //   comment_order: 0,
    //   raw_raw: "insert_china",
    // };

    console.log("Final results", results);

    return Response.json(results.length ? results[0] : []);
  } catch (error) {
    return Response.json({ error: "Failed to extract data" }, { status: 400 });
  }
}
