
export function generateMockData() {
  const users = [
    {
      id: "user1",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=200&width=200",
      status: "online",
    },
    {
      id: "user2",
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=200&width=200",
      status: "busy",
    },
    {
      id: "user3",
      name: "Emma Williams",
      avatar: "/placeholder.svg?height=200&width=200",
      status: "offline",
    },
    {
      id: "user4",
      name: "David Rodriguez",
      avatar: "/placeholder.svg?height=200&width=200",
      status: "online",
    },
    {
      id: "user5",
      name: "Olivia Taylor",
      avatar: "/placeholder.svg?height=200&width=200",
      status: "offline",
    },
  ]

  const mockChats = users.map((user, index) => {
    const now = new Date()
    const messages = []

    // Generate some mock messages
    for (let i = 0; i < 5 + index; i++) {
      const isMe = i % 2 === 0
      const messageTime = new Date(now.getTime() - (5 - i) * 3600000)

      messages.push({
        id: `msg-${user.id}-${i}`,
        content: isMe
          ? `Hey ${user.name}, how's it going? This is message ${i + 1}.`
          : `Hi there! I'm doing well, thanks for asking. This is reply ${i + 1}.`,
        timestamp: messageTime,
        sender: isMe ? "me" : user.id,
        status: "read",
      })
    }

    return {
      id: `chat-${user.id}`,
      user,
      messages,
      lastMessage: {
        content: messages[messages.length - 1].content,
        timestamp: messages[messages.length - 1].timestamp,
      },
    }
  })

  return { mockUsers: users, mockChats }
}
