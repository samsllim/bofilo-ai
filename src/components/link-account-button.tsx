'use client'
import { Button } from "@/components/ui/button"
import { getAurinkoAuthorizationUrl } from "@/lib/aurinko"


const LinkAccountButton = () => {
    return <Button size='sm' variant={'outline'} onClick={async () => {
        const url = await getAurinkoAuthorizationUrl('Google')
        window.location.href = url
    }}>
        Link Account
    </Button>
}

export { LinkAccountButton }