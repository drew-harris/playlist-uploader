import * as ytpl from "ytpl";
export default async function handler(req, res) {
  if (req.method === "POST") {
    console.log(req.body);
    const playlistId = req.body.url;
    try {
      if (playlistId) {
        const playlist = await ytpl(playlistId);
        const items = playlist.items.map((item) => {
          return {
            title: item.title,
            url: item.shortUrl,
            thumbnail: item.thumbnail_url,
          };
        });
        res.json({
          items,
        });
        return;
      } else {
        res.status(400).json({
          message: "Please provide a playlist url",
        });
      }
    } catch (err) {
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  }
}
