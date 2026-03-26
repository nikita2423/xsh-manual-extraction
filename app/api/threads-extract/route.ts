export async function POST(request: Request) {
  try {
    const { input, keyword, date } = await request.json();

    if (!input || !keyword) {
      return Response.json(
        { error: "Input and keyword are required" },
        { status: 400 },
      );
    }

    const prompt = `
    You are extracting structured data from a Threads (threads.net / threads.com) post.
    The user will paste raw text that contains a Threads post. Extract the following fields:

    Fields to extract:
    • post_message — the full text content of the post (exclude the URL itself, exclude any @username mentions at the very start if they are just tagging someone)
    • post_link — the Threads URL (threads.com or threads.net URL)
    • username — the author's username extracted from the URL (the part after @, e.g. "wilson._.tanggg")

    Rules:
    - Keep the URL exactly as it appears, do not modify or normalize it
    - The post_message should contain the actual post content/body text only
    - Remove any tracking parameters or query strings from the URL when extracting post_link (keep only the base URL up to and including the post ID)
    - If the post mentions or tags someone with @ at the beginning, include that in the post_message as it's part of the content
    - Do not include the URL in the post_message
    - The username comes from the URL path, not from @ mentions in the text

    Example input:
    @hk_express 你哋真係有撚病
    我理得你超賣定係要reschedule啲航班
    https://www.threads.com/@wilson._.tanggg/post/DWVuaA0E2T8?xmt=AQF0FPmZ59WQ7QJ3Tk

    Expected extraction:
    post_message: "@hk_express 你哋真係有撚病\\n我理得你超賣定係要reschedule啲航班"
    post_link: "  https://www.threads.com/@wilson._.tanggg/post/DWVuaA0E2T8?xmt=AQF0FPmZ59WQ7QJ3Tk"
    username: "wilson._.tanggg"

    Note:
    - Do not use the example above for output, only use the actual input provided below
    - Strip query parameters (everything after ?) from the Threads URL

    ────────────────────────────────────────

    *Post Text to Analyze:*
    ${input}

    Return JSON array in output:
    {[
      {
        "post_link": "<extracted Threads link without query params>",
        "post_message": "<extracted post message text>",
        "username": "<extracted username from URL>"
      }
    ]}
    `;

    const OPENROUTER_KEY = process.env.OPEN_ROUTER_KEY;

    const schema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          post_link: { type: "string" },
          post_message: { type: "string" },
          username: { type: "string" },
        },
        required: ["post_link", "post_message", "username"],
        additionalProperties: false,
      },
    };

    function extractJsonOrPythonLiteral(text: any) {
      text = text.trim();
      const match = text.match(new RegExp("(\\[.*\\]|\\{.*\\})", "s"));
      if (!match) return null;
      const snippet = match[1];
      try {
        return JSON.parse(snippet);
      } catch (err) {
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
              name: "threads_data",
              strict: true,
              schema,
            },
          },
          temperature: 0.2,
        }),
      },
    );

    const result = await response.json();
    console.log("Threads Result", result);

    const results: any = [];
    if (!result.error) {
      const batchResult = result.choices?.[0]?.message?.content?.trim();
      console.log("threads_batch_result", batchResult);

      const dataJson = extractJsonOrPythonLiteral(batchResult);
      console.log("threads_data_json", dataJson, typeof dataJson);

      if (Array.isArray(dataJson)) {
        let extractionDate: Date;
        if (date) {
          extractionDate = new Date(date);
        } else {
          extractionDate = new Date();
        }

        const isoUtc = extractionDate.toISOString();
        const unixMs = extractionDate.getTime();

        dataJson.forEach((data) => {
          const username = data.username || "unknown";
          results.push({
            country: "Hong Kong",
            lang_abbr: "zh-t",
            medium: "Social",
            site: "Thread",
            channel: username,
            channel_link: `https://www.threads.net/@${username}`,
            thread_link: data.post_link,
            post_link: data.post_link,
            thread_title: data.post_message,
            post_message: data.post_message || keyword,
            post_timestamp: isoUtc,
            unix_timestamp: unixMs,
            comment_count: 0,
            author_name: username,
            author_link: `https://www.threads.net/@${username}`,
            author_id: `threads_${username}`,
            is_comment: false,
            comment_order: 0,
            raw_raw: "nikita_ig_thread",
          });
        });
      }
    }

    console.log("Final threads results", results);

    return Response.json(results.length ? results[0] : []);
  } catch (error) {
    return Response.json(
      { error: "Failed to extract Threads data" },
      { status: 400 },
    );
  }
}
