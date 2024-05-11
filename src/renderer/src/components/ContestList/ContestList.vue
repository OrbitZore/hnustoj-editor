<template>
  <n-infinite-scroll style="width: 400px" :distance="10" @load="loadContest">
    <n-menu :options="menuOptions" />
  </n-infinite-scroll>
</template>

<script setup lang="ts">
import { watch, ref, inject, onMounted, Component, h, reactive } from 'vue'
import * as appkey from '../../AppKey'
import { NInfiniteScroll, NMenu, MenuOption, NIcon, NEllipsis } from 'naive-ui'
import { Book2 } from '@vicons/tabler'
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}
const menuOptions: MenuOption[] = reactive([])
const contestPage = ref(1)
const onlineJudger = inject(appkey.onlineJudgerKey)!
const loadContest = async () => {
  if (!onlineJudger || !onlineJudger.value) return
  const oj = onlineJudger.value
  const result = await window.api.oj.getContestList(oj, {
    pageination: {
      page: contestPage.value
    }
  })
  if (result && result.length) {
    const contestinfos = (
      await Promise.all(
        result.map(async (it) => {
          return await window.api.oj.getContestInfo(oj, it.contestid)
        })
      )
    ).filter(<T,>(it: T): it is NonNullable<T> => !!it)
    console.log(contestinfos)
    menuOptions.push(
      ...contestinfos.map((contestinfo) => ({
        label: () => h(NEllipsis, null, { default: () => contestinfo.contestName }),
        key: 'c' + contestinfo.contestid,
        icon: renderIcon(Book2),
        children:
          contestinfo?.problems.map((problem) => ({
            label: problem.problemName,
            key: 'p' + problem.problemid
          })) || []
      }))
    )
    console.log(menuOptions)
    contestPage.value++
  }
}
onMounted(() => {
  watch(
    onlineJudger!,
    async (newValue, oldValue) => {
      if (newValue === oldValue) return
      menuOptions.length = 0
      contestPage.value = 1
      if (newValue) loadContest()
    },
    { immediate: true }
  )
})
</script>

<style scoped>
.item {
  display: flex;
  align-items: center;
  height: 46px;
  justify-content: center;
  margin-bottom: 10px;
}

.item:last-child {
  margin-bottom: 0;
}
</style>
