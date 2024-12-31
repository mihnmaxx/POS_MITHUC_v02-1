import useSound from 'use-sound'

export function useSoundEffect() {
  const [playClick] = useSound('/sounds/click.mp3')
  const [playSuccess] = useSound('/sounds/beep-success.mp3')
  const [playError] = useSound('/sounds/beep-error.mp3')
  const [playAdd] = useSound('/sounds/add.mp3')
  const [playRemove] = useSound('/sounds/remove.mp3')
  const [playBarcode] = useSound('/sounds/store-scanner-beep.mp3')

  return {
    playClick,    // Click buttons, links
    playSuccess,  // Successful actions
    playError,    // Error notifications
    playAdd,      // Add items
    playRemove,   // Remove items
    playBarcode   // Scan barcode
  }
}
