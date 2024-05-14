<template>
  <n-flex vertical>
    <n-input
      v-model:value="searchString"
      size="large"
      round
      placeholder="搜索"
      :allow-input="noSideSpace"
    />
    <n-spin :show="!!loading">
      <n-infinite-scroll :distance="10" @load="loadContest">
        <n-menu :options="menuOptions" @update-value="clickedMenu" />
      </n-infinite-scroll>
    </n-spin>
  </n-flex>
</template>

<script setup lang="ts">
import { watch, ref, inject, onMounted, Component, h, reactive } from 'vue'
import * as appkey from '../../AppKey'
import {
  NInfiniteScroll,
  NMenu,
  MenuOption,
  NIcon,
  NEllipsis,
  NSpin,
  NFlex,
  NInput
} from 'naive-ui'
import { Book2 } from '@vicons/tabler'
import eventBus from '@lib/eventBus'
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}
const searchString = ref('')
const loading = ref(0)
const menuOptions: MenuOption[] = reactive([])
const contestPage = ref(1)
const onlineJudger = inject(appkey.onlineJudgerKey)!
const noSideSpace = (value: string) => !value.startsWith(' ') && !value.endsWith(' ')
const loadContest = async () => {
  if (!onlineJudger || !onlineJudger.value) return
  loading.value++
  const oj = onlineJudger.value
  const result = await window.api.oj.getContestList(oj, {
    name: searchString.value,
    pageination: !searchString.value
      ? {
          page: contestPage.value
        }
      : undefined
  })
  if (result && result.length) {
    const contestinfos = (
      await Promise.all(
        result.map(async (it) => {
          return await window.api.oj.getContestInfo(oj, it.contestid)
        })
      )
    ).filter(<T,>(it: T): it is NonNullable<T> => !!it)
    if (searchString.value) menuOptions.length = 0
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
    contestPage.value++
  }
  loading.value--
}
function clickedMenu(key: string) {
  console.info('clicked:', key)
  if (key && key.startsWith('p')) {
    eventBus.emit('openProblem', key.slice(1))
  }
}
eventBus.on('ojChanged', () => {
  if (onlineJudger.value) {
    menuOptions.length = 0
    contestPage.value = 1
    searchString.value = ''
    loadContest()
  }
})
onMounted(() => {
  watch(
    searchString,
    async () => {
      menuOptions.length = 0
      contestPage.value = 1
      loadContest()
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
