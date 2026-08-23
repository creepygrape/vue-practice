import axios from 'axios'

const KAKAO_GEO_URL = import.meta.env.VITE_KAKAO_GEO_URL
const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY

export const KAKAO_API_ERROR_MESSAGE = '지역 후보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'

const getCandidateName = (document) => {
  const address = document.address
  if (!address) return document.address_name

  return [address.region_1depth_name, address.region_2depth_name, address.region_3depth_name].filter(Boolean).join(' ')
}

export const searchKakaoLocations = async (keyword) => {
  const { data } = await axios.get(KAKAO_GEO_URL, {
    headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
    params: { query: keyword, size: 30 },
  })
  const uniqueCandidates = new Map()

  data.documents
    .filter((document) => document.address?.b_code)
    .forEach((document) => {
      const bCode = document.address.b_code
      if (uniqueCandidates.has(bCode)) return

      uniqueCandidates.set(bCode, {
        key: bCode,
        displayName: getCandidateName(document),
        addressName: document.address_name,
        region1: document.address.region_1depth_name ?? '',
        lat: Number(document.y),
        lon: Number(document.x),
      })
    })

  return [...uniqueCandidates.values()]
}
