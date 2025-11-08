let localTime = Date.now()

export const getCurrentTime = () => {
  return localTime
}

export function setCurrentTime(offset: number) {
  localTime += offset
  console.log(
    `Local time updated: ${new Date(localTime).toLocaleString('id-ID')}`
  )
}
