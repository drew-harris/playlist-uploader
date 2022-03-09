import { useEffect, useState } from "react";

let sdk = null;

function Track({ data, index }) {
  return (
    <div className="p-3 my-3 font-bold bg-white rounded-md mx-auto w-fit text-tan-700 shadow-sm">
      {index}. {data.title}
    </div>
  );
}

export default function Home() {
  const [playlistInputText, setPlaylistInputText] = useState("");
  const [simpleSongs, setSimpleSongs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [songMessage, setSongMessage] = useState("");
  const [albumMessage, setAlbumMessage] = useState("");

  useEffect(() => {
    async function init() {
      sdk = await import("stem-player-sdk");
      console.log(sdk);
    }

    console.log("%cMADE WITH LOVE BY DONDAINCOMING", "color:red");
    console.log("%cI <3 KANO SO MUCH", "color:red");
    init();
  }, []);

  const getUrls = async () => {
    try {
      const response = await fetch("/api/playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: playlistInputText,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSimpleSongs(data.items);
        console.log(data);
      }
    } catch (error) {
      alert("There was an error getting URLS");
    }
  };

  async function tryUpload(input) {
    console.log(input);
    let data;
    try {
      const response = await fetch("/api/song", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: input.url,
        }),
      });
      if (response.status === 200) {
        console.log(data);
        data = await response.json();
      } else {
        console.log("FAILED TO GET DOWNLOAD DATA");
        throw new Error("Error making download");
      }
    } catch (error) {
      console.log(error);
      throw new Error("Error making download");
    }
    console.log(data);
    const track = {
      title: data.title,
      vocals: data.stems.vocals,
      bass: data.stems.bass,
      drums: data.stems.drums,
      other: data.stems.other,
      bpm: data.bpm,
      colors: ["#FF0000", "#0000FF"],
    };
    try {
      console.log("GENERATING TRACK FROM: ", track);
      const t = await sdk.generateTrack(track);
      await sdk.upload(t, (uploadInfo) => {
        setSongMessage(Math.round(uploadInfo.total * 100) + "%");
      });
      return 1;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async function uploadAll() {
    await sdk.connect();
    setUploading(true);
    try {
      let i = 0;
      while (i < simpleSongs.length) {
        try {
          console.log("trying upload");
          setAlbumMessage(
            "Uploading song " + (i + 1) + " of " + simpleSongs.length
          );
          const response = await tryUpload(simpleSongs[i]);
          i += response;
        } catch (error) {
          console.log(error);
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
      sdk.disconnect();
      setUploading(false);
    } catch (error) {}
  }

  async function cancelUpload() {
    await sdk.cancel();
    setSimpleSongs([]);
    setSongMessage("");
    setAlbumMessage("CANCELLED");
    setUploading(false);
  }

  const simpleSongElements = simpleSongs.map((song, index) => {
    return <Track data={song} key={song.url} index={index + 1} />;
  });
  return (
    <div className="m-6 text-center">
      <span className=" font-bold fixed left-3 top-3 text-left w-full ">
        v0.1.1
      </span>
      <h1 className="text-2xl font-bold uppercase">Playlist Uploader</h1>
      <input
        value={playlistInputText}
        onChange={(e) => setPlaylistInputText(e.target.value)}
        placeholder="YOUTUBE PLAYLIST LINK"
        className="px-3 my-8 py-1 disabled:bg-white text-black transition-shadow shadow-sm w-auto text-center sm:w-[26rem] accent-tan-500 rounded-xl focus:shadow-lg border-tan-500 placeholder:text-tan-400"
      ></input>
      <button
        onClick={getUrls}
        className="p-1 px-2 ml-2 font-semibold text-white rounded-xl first-letter:transition-transform bg-tan-400 hover:shadow-md hover:scale-105"
      >
        SUBMIT
      </button>
      {simpleSongs.length > 0 && !uploading && (
        <button
          onClick={uploadAll}
          className="p-1 block mx-auto px-2 my-6 font-semibold text-white rounded-xl first-letter:transition-transform bg-tan-400 hover:shadow-md hover:scale-105"
        >
          UPLOAD ALL!
        </button>
      )}
      {uploading && (
        <button
          onClick={cancelUpload}
          className="p-1 block mx-auto px-2 my-6 font-semibold text-white rounded-xl first-letter:transition-transform bg-tan-400 hover:shadow-md hover:scale-105"
        >
          CANCEL
        </button>
      )}

      <div
        className="text-tan-400 uppercase
       font-bold"
      >
        {albumMessage}
      </div>
      <div className="text-tan-400 font-bold">{songMessage}</div>

      {simpleSongs.length > 0 && simpleSongElements}
    </div>
  );
}
