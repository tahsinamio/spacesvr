import { useRef, useEffect, ReactNode } from "react";
import { useFrame, useThree } from "react-three-fiber";
import { Vector3 } from "three";
import { isMobile } from "react-device-detect";

import { createPlayerState } from "../utils/player";
import { GyroControls } from "../controls/GyroControls";
import { useSphere } from "@react-three/cannon";
import DragControls from "../controls/DragControls";
import TouchFPSCamera from "../controls/TouchFPSCamera";
import { getSpringValues } from "../utils/spring";
import { AnimatedValue } from "react-spring";
import { PlayerContext } from "../contexts/player";
import { VisibleCapsuleCollider } from "./colliders/CapsuleCollider";

const SHOW_PLAYER_HITBOX = false;

type SpringPlayerProps = {
  spring: AnimatedValue<any>;
};

/**
 * Player represents a physics-enabled player in the environment, complete with a
 * control scheme and a physical representation that interacts with other physics-
 * enabled objects.
 *
 * Spring should be stored as XYZ(S)
 *
 * There should only be one player per environment.
 *
 * @constructor
 */
const SpringPlayer = (
  props: { children: ReactNode[] | ReactNode } & SpringPlayerProps
) => {
  const { children, spring } = props;

  const { camera, raycaster } = useThree();
  const [initX, initY, initZ, initS] = getSpringValues(spring);
  const initPos = new Vector3(initX * initS, initY * initS, initZ * initS);

  // physical body
  const [, bodyApi] = useSphere(() => ({
    mass: 0,
    position: initPos.toArray(),
    args: 1,
    fixedRotation: true,
  }));

  // producer
  const position = useRef(new Vector3(0, 0, 0));
  const velocity = useRef(new Vector3(0, 0, 0));
  const lockControls = useRef(false);

  // setup player
  useEffect(() => {
    bodyApi.position.subscribe((p) => {
      position.current.set(p[0], p[1], p[2]);
    });
    bodyApi.velocity.subscribe((v) => velocity.current.set(v[0], v[1], v[2]));

    const rotation = 0;
    const xLook = initPos.x + 100 * Math.cos(rotation);
    const zLook = initPos.z + 100 * Math.sin(rotation);
    camera?.lookAt(xLook, initPos.y, zLook);

    camera?.position.set(initPos.x, initPos.y, initPos.z);
  }, []);

  // update player every frame
  useFrame(() => {
    const [x, y, z, s = 1] = getSpringValues(spring);
    bodyApi?.position.set(x * s, y * s, z * s);
  });

  const state = createPlayerState(
    bodyApi,
    position,
    velocity,
    lockControls,
    raycaster
  );

  return (
    <PlayerContext.Provider value={state}>
      {isMobile ? (
        <GyroControls fallback={<TouchFPSCamera />} />
      ) : (
        <DragControls />
      )}
      <mesh name="player">
        {SHOW_PLAYER_HITBOX && <VisibleCapsuleCollider />}
      </mesh>
      {children}
    </PlayerContext.Provider>
  );
};

export default SpringPlayer;
