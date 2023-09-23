import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    useEffect,
} from "react";

type ModalContextType = {
    modal: React.ReactNode;
    setModal: (modal: React.ReactNode) => void;
    closeModal: () => void;
};

const defaultContext: ModalContextType = {
    setModal: () => React.Fragment,
    closeModal: () => React.Fragment,
    modal: null,
};
const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => useContext(ModalContext) ?? defaultContext;

export default function ModalHandler({
    children,
}: {
    children: React.ReactNode;
}) {
    const [modal, setActiveModal] = useState<React.ReactNode>(null);

    const setModal = useCallback((modal: React.ReactNode) => {
        setActiveModal(modal);
    }, []);

    const closeModal = useCallback(() => {
        setModal(null);
    }, [setModal]);

    const providerValue = useMemo<ModalContextType>(
        () => ({ setModal, closeModal, modal }),
        [modal, setModal, closeModal],
    );

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        document.addEventListener("keydown", listener);
        return () => document.removeEventListener("keydown", listener);
    }, [setModal, closeModal]);

    // TODO: Animate background opacity when opening/closing modal
    return (
        <ModalContext.Provider value={providerValue}>
            <>
                {modal && (
                    <div
                        className="absolute w-full h-full top-0 left-0 flex justify-center items-center transition-all z-50"
                        style={{
                            backgroundColor: modal
                                ? "rgba(50, 50, 50, 0.2)"
                                : "rgba(50, 50, 50, 0)",
                        }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) closeModal();
                            e.stopPropagation();
                        }}
                    >
                        {modal}
                    </div>
                )}
                {children}
            </>
        </ModalContext.Provider>
    );
}
