import {
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import Lottie from "lottie-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";
import blockchainAnimation from "../../../public/blockchainAnimation.json";
import { useStatus } from "../../hooks/useStatus";
import ReactCanvasConfetti from "react-canvas-confetti";

export const StatusLoader: React.FC = () => {
  const address = useAddress();
  const statusQuery = useStatus(address, 2000);

  const refAnimationInstance = useRef<confetti.CreateTypes | null>(null);

  const getInstance = useCallback((instance) => {
    refAnimationInstance.current = instance;
  }, []);

  const makeShot = useCallback((particleRatio, opts) => {
    if (refAnimationInstance.current) {
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      });
    }
  }, []);

  const fire = useCallback(() => {
    makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    makeShot(0.2, {
      spread: 60,
    });

    makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, [makeShot]);

  const router = useRouter();

  useEffect(() => {
    if (!statusQuery.data?.minted) {
      return;
    }
    const t = setTimeout(() => {
      try {
        fire();
      } catch (err) {
        console.error("failed to fire confetti", err);
      }
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusQuery.data?.minted]);

  useEffect(() => {
    if (statusQuery.data?.minted && router.asPath !== "/claimed") {
      router.push("/claimed");
    } else if (statusQuery.data?.mintFailed && router.asPath !== "/") {
      router.push("/");
    }
  }, [router, statusQuery]);

  if (
    statusQuery.data?.status.state === "PROCESSING" ||
    (statusQuery.data?.status.state === "SUCCESS" &&
      !statusQuery.data.minted &&
      !statusQuery.data.mintFailed)
  ) {
    return (
      <>
        <Modal
          closeOnEsc={false}
          closeOnOverlayClick={false}
          isCentered
          isOpen
          onClose={() => undefined}
        >
          <ModalOverlay backdropFilter="blur(15px)" />
          <ModalContent
            p={8}
            bg="transparent"
            boxShadow="none"
            overflow="hidden"
          >
            <ModalBody h="100%">
              <Lottie animationData={blockchainAnimation} loop />
              <Heading color="#fff" size="md" textAlign="center">
                Your NFT is being minted...
              </Heading>
            </ModalBody>
          </ModalContent>
        </Modal>
        <ReactCanvasConfetti
          refConfetti={getInstance}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
      </>
    );
  }

  return (
    <ReactCanvasConfetti
      refConfetti={getInstance}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
};
