<template>
  <n-flex vertical>
    <n-spin size="large" :show="loading">
      <n-select
        v-model:value="selectedValue"
        filterable
        clearable
        placeholder="选择OnlineJudger"
        :options="options"
      />
      <n-result :title="`用户名：${userid}`" :description="`昵称：${username}`">
        <template #icon>
          <n-icon size="120">
            <User />
          </n-icon>
        </template>
      </n-result>
    </n-spin>
  </n-flex>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue'
import { User } from '@vicons/fa'
import * as appkey from '../../AppKey'
import { SelectOption, NSelect, NResult, NIcon, NSpin, NFlex } from 'naive-ui'

const selectedValue = inject(appkey.onlineJudgerKey)!
const loading = ref(false)
const userid = ref('')
const username = ref('')
const options: SelectOption[] = []

onMounted(async () => {
  options.length = 0
  const ojs = await window.api.oj.list()
  ojs.forEach((v, k) => {
    options.push({
      label: v,
      value: k
    })
  })
  watch(selectedValue!, async (newValue, oldValue) => {
    if (oldValue && oldValue === newValue) return
    loading.value = true
    const account = await window.api.oj.login(newValue!)
    if (account) {
      userid.value = account.userid
      username.value = account.username
    } else {
      userid.value = '登陆失败'
      username.value = ''
    }
    loading.value = false
    console.log(userid.value)
  })
})
</script>
