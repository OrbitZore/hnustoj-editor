export interface AppConf {
  // 编译器输出缓冲区上限，超过忽略，单位字节
  CompilerOutputLimit: number
  // 程序输出上限
  ProgramOutputLimit: number
  // 程序执行超时上限
  ProgramTimeLimit: number
  Terminal: {
    // 终端输出上限
    OutputLimit: number
    // 终端shell命令
    TerminalCommand: string
  }
  LanguageProvicer: {
    cpp: {
      // 编译器编译命令
      compileCommand: string
    }
  }
}
