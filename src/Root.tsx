import { Composition } from 'remotion';
import { RaidMechanicVideo } from './RaidMechanicVideo';
import { MechanicComposition } from './compositions/MechanicComposition';
import { sampleMechanic } from './data/sampleMechanic';
import './style.css';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Phase 3: タイムラインベースのギミック */}
      <Composition
        id="SampleMechanic"
        // @ts-expect-error - Remotion typing workaround
        component={MechanicComposition}
        durationInFrames={sampleMechanic.durationFrames}
        fps={sampleMechanic.fps}
        width={1920}
        height={1080}
        defaultProps={{
          mechanic: sampleMechanic,
        }}
      />
      {/* Phase 2: 基本的な散開デモ */}
      <Composition
        id="RaidMechanicVideo"
        component={RaidMechanicVideo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
