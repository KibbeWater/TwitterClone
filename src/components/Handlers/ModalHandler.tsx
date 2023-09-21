import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

type ModalContextType = {
    modal: React.ReactNode;
    setModal: (
        modal: React.ReactNode,
    ) => void /* React.Dispatch<React.SetStateAction<React.ReactNode>> */;
};

const defaultContext: ModalContextType = {
    setModal: () => React.Fragment,
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

    const providerValue = useMemo<ModalContextType>(
        () => ({ setModal, modal }),
        [modal, setModal],
    );

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
                            setModal(null);
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
