export async function POST(request: Request) {
  try {
    const data = await request.json();
    const URL = "https://prod-datainserter.fasta.ai/api/datapool/insert";

    const HEADERS = {
      "Content-Type": "application/json",
      Authorization: `Basic ${process.env.DATA_INSERT_TOKEN}`,
    };

    async function sendChunks(data: any, chunkSize: any) {
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);

        try {
          const response = await fetch(URL, {
            method: "POST",
            headers: HEADERS,
            body: JSON.stringify(chunk),
          });

          console.log("Insert Response", chunk.length, response.ok);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const text = await response.text();
          console.log(text);
        } catch (err) {
          console.error("Error Data:", err);
        }
      }

      console.log("All Done!!");
    }
    console.log("Inserting data:", [data]);
    await sendChunks([data], 100);
    console.log("Insert Complete");
    return Response.json({
      success: true,
      message: "Data inserted successfully",
      id: Math.random().toString(36).substr(2, 9),
    });

    // // TODO: Replace with your actual insert logic
    // // This could save to a database, send to another API, etc.
    // console.log("Inserting data:", data);

    // return Response.json({
    //   success: true,
    //   message: "Data inserted successfully",
    //   id: Math.random().toString(36).substr(2, 9),
    // });
  } catch (error) {
    return Response.json({ error: "Failed to insert data" }, { status: 400 });
  }
}
