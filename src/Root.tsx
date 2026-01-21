import { Composition } from 'remotion';
import { RaidMechanicVideo } from './RaidMechanicVideo';
import './style.css';

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
