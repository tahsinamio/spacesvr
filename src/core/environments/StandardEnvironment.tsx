import styled from "@emotion/styled";
import Crosshair from "../tools/Crosshair";
import { ProviderProps } from "@react-three/cannon/dist/Provider";
import { Physics } from "@react-three/cannon";
import { Vector3 } from "three";
import { ContainerProps } from "react-three-fiber/targets/shared/web/ResizeContainer";
import Player from "../players/Player";
import { useEnvironmentState, environmentStateContext } from "../utils/hooks";
import { EnvironmentProps } from "../types";
import { InfinitePlane } from "../../components/";
import GlobalStyles from "../styles/GlobalStyles";
import { ReactNode } from "react";
import Navigator from "../tools/Navigator";
import LoadingScreen from "../overlays/LoadingScreen";
import { VRCanvas } from "@react-three/xr";

const Container = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;

  canvas {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    outline: 0;
    cursor: none;
  }
`;

const defaultCanvasProps: Partial<ContainerProps> = {
  gl: {
    powerPreference: "high-performance",
    antialias: true,
    depth: true,
    alpha: false,
    stencil: false,
  },
  concurrent: true,
  shadowMap: false,
  pixelRatio: [1, 2],
  camera: { position: [0, 2, 0], near: 0.01, far: 150 },
  noEvents: true,
  // disable default enter vr button
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onCreated: () => {},
};

const defaultPhysicsProps: Partial<ProviderProps> = {
  size: 50,
  allowSleep: false,
  gravity: [0, -9.8 * 2, 0],
  defaultContactMaterial: {
    friction: 0,
  },
};

type StandardEnvironmentProps = {
  player?: {
    pos?: Vector3;
    rot?: number;
    speed?: number;
  };
  navigator?: ReactNode;
  disableGround?: boolean;
  loadingScreen?: ReactNode;
};

/**
 *
 * Standard environment should be your first choice for an environment
 *
 * Player Type: First Person w/ WASD, Joystick controls
 * Physics: Enabled with default y=0 floor plane
 * Loading Screen: Spaces Edition
 * Pause Menu: Spaces Edition
 *
 */
export const StandardEnvironment = (
  props: EnvironmentProps & StandardEnvironmentProps
) => {
  const {
    children,
    canvasProps,
    physicsProps,
    player,
    disableGround,
    navigator,
    loadingScreen,
  } = props;

  const state = useEnvironmentState();

  return (
    <>
      <GlobalStyles />
      <Container ref={state.containerRef}>
        <VRCanvas {...defaultCanvasProps} {...canvasProps}>
          <Physics {...defaultPhysicsProps} {...physicsProps}>
            <environmentStateContext.Provider value={state}>
              <Player
                initPos={player?.pos}
                initRot={player?.rot}
                speed={player?.speed}
              />
              <Crosshair />
              {navigator || <Navigator />}
              {!disableGround && <InfinitePlane height={-0.001} />}
              {children}
            </environmentStateContext.Provider>
          </Physics>
        </VRCanvas>
        <environmentStateContext.Provider value={state}>
          {loadingScreen || <LoadingScreen />}
        </environmentStateContext.Provider>
      </Container>
    </>
  );
};
