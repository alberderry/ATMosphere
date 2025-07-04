// src/components/ConfirmAlertDialog.jsx
import React from 'react';
import {
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Button
} from '@chakra-ui/react';

const ConfirmAlertDialog = ({
    isOpen,
    onClose,
    onConfirm,
    header,
    body,
    confirmButtonText,
    confirmButtonColor,
    cancelRef
}) => {
    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent borderRadius="lg">
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        {header}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {body}
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Tidak
                        </Button>
                        <Button colorScheme={confirmButtonColor} onClick={onConfirm} ml={3}>
                            {confirmButtonText}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
};

export default ConfirmAlertDialog;