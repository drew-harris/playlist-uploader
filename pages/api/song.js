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

      console.log(kanoResponse.data);

      if (kanoResponse.data.status === "ready") {
        res.json({
          bpm: kanoResponse.data.metadata.bpm,
          stems: kanoResponse.data.stems,
          status: kanoResponse.data.status,
          artist: kanoResponse.data.metadata.artist,
          title: kanoResponse.data.metadata.title,
        });
      } else {
        res.status(202).json({
          status: kanoResponse.data.status,
        });
      }

      const stemifyResponse = await axios.post(
        "https://stemify2.net/api/tickets/automatic",
        {
          url: req.body.url,
        }
      );
      console.log(stemifyResponse.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  }
}
