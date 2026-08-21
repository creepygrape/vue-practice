.env : baseurl, apikey
constants/weather.js : citypool

element-plus : fetch openweather api loading, pagination, 습도 progress
pagination component: paginationBar

localstorage 즐겨찾기(카드 + 상세페이지)
즐겨찾기만 보기
최근 본 도시
테마
정렬

검색 도시 추가
5일 예보 + 그래프?

트러블슈팅
(1) store 변수, 함수 선언 순서 : 즐겨찾기 -> 로컬 스토리지 순으로 했더니 저장은 되는데 로드 안됨. 이유는 로컬 스토리지 로드, 저장이 나중에 선언돼서 접근 불가. 함수 호출은 해도 괜찮지만 참조 값은 호출 시점까지 미리 선언/초기화돼 있어야함. 
보통 다음과 같은 의존 관계 순서로 작성
1. 상수
2. 상수를 사용하는 보조 함수
3. 보조 함수 결과로 만드는 상태(ref)
4. 상태를 변경하는 함수
5. return
