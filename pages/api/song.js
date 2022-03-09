import axios from "axios";
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Get stems
      const kanoResponse = await axios.post(
        "https://api.stemplayer.com/tracks",
        {
          link: req.body.url,
          stem_codec: "mp3",
        }
      );

      console.log(kanoResponse.data.data);
      try {
        const stemifyResponse = await axios.post(
          "https://stemify2.net/api/tickets/automatic",
          {
            url: req.body.url,
          }
        );
        console.log(stemifyResponse?.data);
      } catch (error) {}

      if (kanoResponse.data.data.status == "ready") {
        res.json({
          bpm: kanoResponse.data.data.metadata.bpm,
          stems: kanoResponse.data.data.stems,
          status: kanoResponse.data.data.status,
          artist: kanoResponse.data.data.metadata.artist,
          title: kanoResponse.data.data.metadata.title,
        });
      } else {
        res.status(202).json({
          status: kanoResponse.data.data.status,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  }
}
