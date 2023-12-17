import lodash from "lodash";
import { useMemo, useState } from "react";
import { SyncManager } from "../sync/sync";

type MOUSE_STATE = "up" | "down" | "dragging";

export interface IUserDetails {
  mousePosition: number[];
  mouseState: MOUSE_STATE;
  name: string;
  userColor: string;
  joinTime: number;
}

interface IPresenceInit {
  presenceId: string;
}

interface IPresenceAdd {
  name: string;
  joinTime?: number;
  color?: string;
}

export interface IRoomData {
  users: { [userId: string]: IUserDetails };
}

const INITIAL_ROOM_DATA: IRoomData = {
  users: {},
};

const getRandomColor = () => {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

let loadedData: any;
let userName: string;

export const usePresence = () => {
  const [value, setValue] = useState(0);
  // const [loadedData, setLoadedData] = useState(null);
  const id = useMemo(() => (Math.random() + 1).toString(36).substring(7), []);

  const onChange = (patch: any) => {
    setValue((value) => value + 1);
  };

  const onLocalChange = () => {
    console.log("[onLocalChange]");
    setValue((value) => value + 1);
  };

  // const onConnect = useCallback(() => {
  //   const myDetails = {
  //     name: userName,
  //     mousePosition: [window.screen.width / 2, window.screen.height / 2],
  //     mouseState: "up",
  //     userColor: getRandomColor(),
  //   };
  //   console.log("[onConnect]", myDetails, loadedData);
  //   // @ts-ignore
  //   loadedData?.users.insert(id, myDetails);
  // }, [loadedData]);

  const removeSelf = () => {
    // @ts-ignore
    loadedData?.users.delete(id);
  };

  const add = (params: IPresenceAdd) => {
    const myDetails = {
      name: params.name,
      mousePosition: [window.screen.width / 2, window.screen.height / 2],
      mouseState: "up",
      userColor: params.color ?? getRandomColor(),
      joinTime: params.joinTime || Date.now(),
    };
    // @ts-ignore
    loadedData?.users.insert(SyncManager._io.id, myDetails);
  };

  const init = async ({ presenceId }: IPresenceInit): Promise<IRoomData> => {
    userName = "";
    loadedData = await SyncManager.create({
      data: INITIAL_ROOM_DATA,
      collectionName: "",
      refid: presenceId,
      onChange,
      name: "",
      onLocalChange,
      // onConnect: onConnect,
    });

    // SyncManager.setupEventListener(
    //   "room:user:add:" + presenceId,
    //   (data: any) => {
    //     loadedData.users.delete(data.socketId);
    //     setValue((value) => value + 1);
    //   }
    // );

    SyncManager.setupEventListener(
      "room:user:remove:" + presenceId,
      (data: any) => {
        console.log("removing user", data);
        loadedData.users.delete(data.socketId);
        setValue((value) => value + 1);
      }
    );

    // setup listeners for my mouse position move

    // const setXY = lodash.debounce((x, y) => {
    //   console.log("[mouse:pos:change]", x, y);
    //   loadedData.users[id].mousePosition = [y, x];
    // }, 5);

    // window.addEventListener("mousedown", (event) => {
    //   loadedData.users[id].mouseState = "down";
    // });

    // window.addEventListener("mouseup", (event) => {
    //   loadedData.users[id].mouseState = "up";
    // });

    // window.addEventListener("mousemove", (event) => {
    //   if (loadedData.users[id].mouseState === "down") {
    //     loadedData.users[id].mouseState = "dragging";
    //   }
    //   setXY(event.clientX, event.clientY);
    // });

    // window.addEventListener("touchmove", (event) => {
    //   if (loadedData.users[id].mouseState === "down") {
    //     loadedData.users[id].mouseState = "dragging";
    //   }
    //   setXY(event.touches[0].clientX, event.touches[0].clientY);
    // });
    // window.addEventListener("touchstart", () => {
    //   loadedData.users[id].mouseState = "down";
    // });
    // window.addEventListener("touchend", () => {
    //   loadedData.users[id].mouseState = "up";
    // });

    setValue((value) => value + 1);

    return loadedData;
  };

  return { init, value, removeSelf, add };
};
