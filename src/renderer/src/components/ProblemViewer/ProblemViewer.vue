<template>
  <div>
    <n-flex vertical align="stretch">
      <!-- <n-input v-model:value="pid">
        <template #prefix> 题目ID： </template>
      </n-input> -->
      <n-tabs
        v-model:value="value"
        type="card"
        :addable="true"
        :closable="closable"
        tab-style="min-width: 80px;"
        @close="handleClose"
        @add="handleAdd"
      >
        <n-tab-pane
          v-for="panel in panels"
          :key="panel.key"
          :name="[panel.key, panel.status].join('-')"
        >
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
    </n-flex>
  </div>
</template>
<script setup lang="ts">
import { NTabs, NTabPane, NFlex, NInput, NSpace } from 'naive-ui'
import { computed, inject, reactive, ref } from 'vue'
// const pid = ref('')
const value = ref(1)
import * as appkey from '../../AppKey'
const onlineJudger = inject(appkey.onlineJudgerKey)!
const panels = reactive([
  {
    key: 1,
    status: '',
    data: { input: '', ans: '', output: '' }
  }
])
const closable = computed(() => {
  return panels.length > 1
})
function handleAdd() {
  for (let i = 1; i < 128; i++) {
    if (!panels.find((panel) => panel.key === i)) {
      const newValue = { key: i, status: '', data: { input: '', ans: '', output: '' } }
      panels.push(newValue)
      break
    }
  }
}
function handleClose(name: number) {
  const index = panels.findIndex((panel) => panel.key === name)
  panels.splice(index, 1)
}
async function openProblem(problemid: string) {
  if (!onlineJudger.value) return
  const problem = await window.api.oj.getProblemInfo(onlineJudger.value, problemid)
  if (problem) {
    panels.length = 0
    const { tests } = problem
    for (let i = 0; i < tests.length; i++) {
      panels.push({
        key: i + 1,
        status: '',
        data: { input: tests[i]._in, ans: tests[i].ans, output: '' }
      })
    }
  }
}
defineExpose({
  openProblem
})
</script>

<style scoped></style>
