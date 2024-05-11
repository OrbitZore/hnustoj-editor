export function URLEqual(url1, url2) {
  const parsedUrl1 = new URL(url1)
  const parsedUrl2 = new URL(url2)

  return parsedUrl1.href === parsedUrl2.href
}

export const baseURI = 'http://acm.hnust.cn'

export const rootURL = baseURI
export const loginPage = baseURI + '/loginpage.php'
export const loginAPI = baseURI + '/login.php'
export const problemset = (page = 1) => baseURI + `/problemset.php?page=${page}`
export const homeworkPage = (page = 1) => baseURI + `/contest.php?page=${page}`
export const contestInfoPage = (cid) => baseURI + `/contest.php?cid=${cid}`
export const problemInfoPage = (id) => baseURI + `/problem.php?id=${id}`
export const ContestProblemInfoPage = (cid, pid) => baseURI + `/problem.php?cid=${cid}&id=${pid}`
export const contestPage = (page = 1) => baseURI + `/contest_reg.php?page=${page}`
export const myImpartPage = (page = 1) => baseURI + `/contest.php?page=${page}&my`
export const problemTagPage = baseURI + '/category.php'
export const myinfo = baseURI + '/modifypage.php'
export const userinfo = (uid) => baseURI + `/userinfo.php?user=${uid}`
