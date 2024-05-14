<template>
  <div>
    <n-flex vertical align="stretch">
      <!-- <n-input v-model:value="pid">
        <template #prefix> 题目ID： </template>
      </n-input> -->
      <n-flex>
        <template v-for="panel in panels" :key="panel.key">
          <n-tag :color="{ color: panel.color }">
            {{ panel.key }} {{ panel.status ? '-' + panel.status : '' }}
          </n-tag>
        </template>
      </n-flex>
      <n-tabs
        v-model:value="selectedTab"
        type="card"
        :addable="true"
        :closable="closable"
        tab-style="min-width: 80px;"
        @close="handleClose"
        @add="handleAdd"
      >
        <n-tab-pane v-for="panel in panels" :key="panel.key" :name="panel.key">
          <n-space vertical align="stretch">
            <n-input
              v-model:value="panel.data.input"
              type="textarea"
              placeholder="输入..."
            ></n-input>
            <n-input v-model:value="panel.data.ans" type="textarea" placeholder="答案..."></n-input>
            <n-input
              v-model:value="panel.data.output"
              type="textarea"
              placeholder="输出..,."
            ></n-input>
          </n-space>
        </n-tab-pane>
      </n-tabs>
      <n-button type="primary"> 运行 </n-button>
    </n-flex>
  </div>
</template>
<script setup lang="ts">
import { NFlex, NInput, NSpace, NTabPane, NTag, NTabs, NButton } from 'naive-ui'
import { computed, inject, nextTick, reactive, ref } from 'vue'
import eventBus from '@lib/eventBus'
import Queue from 'queue'
const selectedTab = ref(1)
import * as appkey from '../../AppKey'
const onlineJudger = inject(appkey.onlineJudgerKey)!
const filename = inject(appkey.editorPath)!
const panels = reactive([
  {
    key: 1,
    status: '',
    color: '',
    data: { input: '', ans: '', output: '' }
  }
])
const closable = computed(() => {
  return panels.length > 1
})
function handleAdd() {
  for (let i = 1; i < 128; i++) {
    if (!panels.find((panel) => panel.key === i)) {
      const newValue = { key: i, status: '', color: '', data: { input: '', ans: '', output: '' } }
      panels.push(newValue)
      break
    }
  }
}
function handleClose(key: number) {
  const index = panels.findIndex((panel) => panel.key === key)
  panels.splice(index, 1)
}
eventBus.on('openProblem', async (problemid: string) => {
  if (!onlineJudger.value) return
  eventBus.emit('showSiderbarComponent', 'ProblemViewer')
  const problem = await window.api.oj.getProblemInfo(onlineJudger.value, problemid)
  if (problem) {
    panels.length = 0
    const { tests } = problem
    for (let i = 0; i < tests.length; i++) {
      panels.push({
        key: i + 1,
        status: '',
        color: '',
        data: { input: tests[i]._in, ans: tests[i].ans, output: '' }
      })
    }
    selectedTab.value = 1
  }
})
// eventBus.on('runtest', async () => {
//   const compileResult = await window.api.lsp.compile(filename.value)
//   if (!compileResult) return
//   console.info('compile:', compileResult)
//   const { code, outfilename } = compileResult
//   if (code) {
//     for (let i = 0; i < panels.length; i++) {
//       panels[i].status = '编译错误'
//       panels[i].color = 'yellow'
//     }
//     return
//   }
//   const queue = new Queue({ concurrency: 4 })
//   for (let i = 0; i < panels.length; i++) {
//     const panel = panels[i]
//     queue.push(async () => {
//       panel.status = 'running'
//       const result = await window.api.lsp.run(outfilename, panel.data.input, panel.data.ans)
//       panel.status = result ? 'success' : 'fail'
//       panel.data.output = result
//     })
// })
</script>

<style scoped></style>
